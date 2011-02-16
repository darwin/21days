var dayTable = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

Date.prototype.getD = function() {
    return Math.floor(this.valueOf() / (1000*60*60*24));
}

var newD = function(d) {
    return new Date(d*(1000*60*60*24));
}

window.stage = 0;

window.refDay = (new Date()).getD();
window.today = (new Date()).getD();

var initedStages = {};
var wentThroughLanding = false;

function computeInitialViewDay(referenceDay, startDay) {
    var daysSinceBeginning = referenceDay - startDay;
    var weeksSinceBeginning = Math.floor(daysSinceBeginning / 7);
    return startDay + (weeksSinceBeginning * 7);
}

function resetSession() {
    FB.logout(function(response) {
        // user is now logged out from facebook
        location.reload();
    });
}

function switchStage(stage) {
    // console.log('switchStage: ', stage)
    if (!initedStages[stage]) {
        initedStages[stage] = true;
        $('.comments-footer').hide();
        if (stage==0) {
            $('.routine-start').bind('click', function() {
                switchStage(1);
                wentThroughLanding = true;
            });
            $('.routine-alternate-start').bind('click', function() {
                switchStage(1);
                wentThroughLanding = true;
            });
        }
        if (stage==1) {
            $('.potemkin-routine-name').html($('#page-landing .new-routine-picker').val());
            $('.fake-connect-button').bind('click', function() {
                FB.login(function(response) {
                    if (response.session) {
                        // user successfully logged in
                        
                    } else {
                        // user cancelled login
                    }
                });            
            });
        }
        if (stage==2) {
            $('.addnew-button').bind('click', function() {
                $(this).hide();
                $('#page-standard .create-routine').show();
                $('.new-routine').focus();
            });
            $('.cal-left-arrow').bind('click', function() {
                refDay -= 7;
                App.user.addAll();
                App.user.trigger('change');
                $('.badges-potemking').hide();
            });
            $('.cal-right-arrow').bind('click', function() {
                refDay += 7;
                App.user.addAll();
                App.user.trigger('change');
                $('.badges-potemking').hide();
            });
            $('.comments-footer').show();
        }
    }

    $('body').get(0).className = 'selected-stage-'+stage;
    
    window.stage = stage;
    $('.stage').hide();
    $('.stage-'+stage).show();
    
}

// some workaround for case when facebook is too fast and calls us before window.App get initialized
var pendingTasks = [];
window.ensureAppInit = function(fn) {
    if (!window.App) {
        pendingTasks.push(fn);
    } else {
        fn();
    }
}

$(function() {
    
    window.User = Backbone.Model.extend({
        url: '/users',
        collection: 'users',
        
        initialize: function() {
            _.bindAll(this, 'addOne', 'addAll');

            if (!this.get("start_day")) {
                this.set({
                    "start_day": today, 
                });
            }
            
            this.routines = new RoutineList;
            this.routines.bind('add', this.addOne);
            this.routines.bind('refresh', this.addAll);
        },

        addOne: function(routine) {
            var view = new RoutineView({
                model: routine,
                firstDay: computeInitialViewDay(refDay, this.get('start_day'))
            });
            $(".routine-list").append(view.render().el);
        },

        addAll: function() {
            $(".routine-list").empty();
            this.routines.each(this.addOne);
        }


    });
    
    window.Routine = Backbone.Model.extend({
        EMPTY: "define your routine...",

        initialize: function() {
            if (!this.get("name")) {
                this.set({
                    "name": this.EMPTY
                });
            }
            if (!this.get("frequency")) {
                this.set({
                    "frequency": 1
                });
            }
            if (!this.get("checkins")) {
                this.set({
                    "checkins": {}
                });
            }
        },

        isDayChecked: function(dindex) {
            var checkins = this.get('checkins');
            if (checkins) {
                var record = checkins[dindex];
                if (record && record.checked) return true;
            }
            return false;
        },
        
        toggleDayCheckin: function(dindex) {
            var checkins = this.get('checkins') || {};
            var record = checkins[dindex];
            if (!record) {
                checkins[dindex] = {
                    checked: true
                };
            } else {
                checkins[dindex].checked = !checkins[dindex].checked;
            }
            this.set({
                'checkins': checkins
            });
        },
        
        clear: function() {
            this.destroy();
            this.view.remove();
        }
    });

    window.RoutineList = Backbone.Collection.extend({
        model: Routine,
        
        done: function() {
            return this.filter(function(routine) {
                return routine.get('done');
            });
        },

        remaining: function() {
            return this.without.apply(this, this.done());
        },

        nextOrder: function() {
            if (!this.length) return 1;
            return this.last().get('order') + 1;
        },

        comparator: function(routine) {
            return routine.get('order');
        }
    });

    window.DayView = Backbone.View.extend({
        className: 'day',
        events: {
            "click": "check",
        },

        initialize: function() {
            _.bindAll(this, 'render');
        },

        render: function() {
            var root = $(this.el);
            if (this.model.isDayChecked(this.options.dindex)) { 
                root.addClass('checked');
            }
            if (this.options.dindex==window.today) {
                root.addClass('today');
            }
            if (this.options.dindex < App.user.get("start_day")) {
                root.addClass('disabled');
            }
            root.attr('data-dindex', this.options.dindex);
            return this;
        },

        check: function() {
            console.log('checked', this.model);
            this.model.toggleDayCheckin(this.options.dindex);
            this.model.save();
        }

    });

    window.DayHeaderView = Backbone.View.extend({
        className: 'day-header',
        template: _.template($('#day-header-template').html()),

        initialize: function() {
            _.bindAll(this, 'render');
        },

        render: function() {
            var root = $(this.el);
            var dindex = this.options.dindex;
            
            var date = newD(dindex);
            var dayNum = date.getDay();
            var month = date.getMonth()+1;
            var monthDay = date.getDate();
            var dayString = dayTable[dayNum];
            var shortDate = monthDay+"."+month+".";
            
            if (this.options.dindex==window.today) {
                root.addClass('today');
            }
            root.attr('data-dindex', this.options.dindex);
            
            root.html(this.template({
                day: dayString,
                shortDate: shortDate
            }));
            return this;
        },
    });

    window.WeekHeaderView = Backbone.View.extend({
        className: 'week-header',
        events: {
        },

        initialize: function() {
            _.bindAll(this, 'render');
        },

        render: function() {
            var root = $(this.el);
            for (var i=0; i<7; i++) {
                var day = new DayHeaderView({
                    dindex: this.options.dindex + i
                });
                day.render();
                root.append(day.el);
            }
            
            return this;
        },
    });

    window.WeekView = Backbone.View.extend({
        className: 'week',
        events: {
        },

        initialize: function() {
            _.bindAll(this, 'render');
        },

        render: function() {
            var root = $(this.el);
            for (var i=0; i<7; i++) {
                var day = new DayView({
                    model: this.model,
                    dindex: this.options.dindex + i
                });
                day.render();
                root.append(day.el);
            }
            root.append('<div class="clear"></div>');
            
            return this;
        },
    });

    window.RoutineView = Backbone.View.extend({
        tagName: "li",
        template: _.template($('#routine-template').html()),
        events: {
            "dblclick div.routine-name": "edit",
            "keypress .routine-input": "updateOnEnter"
        },

        initialize: function() {
            _.bindAll(this, 'render', 'close');
            this.model.bind('change', this.render);
            this.model.view = this;
        },

        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            this.setContent();
            
            var week1 = new WeekView({
                model: this.model,
                dindex: this.options.firstDay
            });
            var week2 = new WeekView({
                model: this.model,
                dindex: this.options.firstDay + 7
            });
            var week3 = new WeekView({
                model: this.model,
                dindex: this.options.firstDay + 14
            });
            
            week1.render();
            week2.render();
            week3.render();
            
            this.$('.routine-weeks').empty().append(week1.el, week2.el, week3.el, '<div class="clear"></div>');
            
            return this;
        },

        setContent: function() {
            var name = this.model.get('name');
            this.$('.routine-name').text(name);
            this.$input = this.$('.routine-input');
            this.$input.bind('blur', this.close);
            this.$input.val(name);
        },
        
        close: function() {
            this.model.save({name: this.$input.val()});
            $(this.el).removeClass("editing");
        },

        edit: function() {
            $(this.el).addClass("editing");
            this.$input.focus();
        },

        updateOnEnter: function(e) {
            if (e.keyCode == 13) {
                this.close();
            }
        },

        remove: function() {
            $(this.el).remove();
        },
        
        clear: function() {
            this.model.clear();
        }
    });

    window.AppView = Backbone.View.extend({
        el: $("#dayapp"),
        events: {
            "keypress .new-routine": "createOnEnter",
            "keydown .new-routine": "handleEsc",
            "keypress .new-routine-frequency": "createOnEnter",
            "click .routine-clear a": "clearCompleted"
        },

        initialize: function() {

            _.bindAll(this, 'render');
            
            this.$input = this.$(".new-routine");
            this.$frequency = this.$(".new-routine-frequency").eq(1);
            
            this.user = new User();
            this.user.routines.bind('all', this.render);
            this.user.bind('all', this.render);
        },
        
        render: function() {
            this.options.firstViewDay = computeInitialViewDay(refDay, this.user.get("start_day")); // refDay is global
            
            var week1 = new WeekHeaderView({
                dindex: this.options.firstViewDay
            });
            var week2 = new WeekHeaderView({
                dindex: this.options.firstViewDay + 7
            });
            var week3 = new WeekHeaderView({
                dindex: this.options.firstViewDay + 14
            });
            
            week1.render();
            week2.render();
            week3.render();
            
            $('.routine-header-weeks').empty().append(week1.el, week2.el, week3.el, '<div class="clear"></div>');
            $('.routines').show();
        },

        newAttributes: function() {
            return {
                name: this.$input.val(),
                frequency: parseInt(this.$frequency.val().substring(1), 10), //  f1, f3 or f7
                order: this.user.routines.nextOrder()
            };
        },

        createOnEnter: function(e) {
            if (e.keyCode == 13) {
                this.user.routines.create(this.newAttributes());
                this.$input.val('');
            }
        },
        
        handleEsc: function(e) {
            if (e.keyCode==27) {
                $('.addnew-button').show();
                $('#page-standard .create-routine').hide();
            }
        }
    });

    window.App = new AppView;
    _.each(pendingTasks, function(task) {
        task();
    });
});

function addAnglelsAction() {
    FB.ui({
        method: 'apprequests', 
        message: 'Please become my *angel* for 21 Days', 
        data: 'angels'
    });
}

function processLoginEvent(response) {
    switchStage(2);
    
    FB.api('/me', function(response) {
        
        // show avatar
        var $avatar = $('.fb-avatar');
        var template = _.template($('#avatar-template').html());
        $avatar.html(template({
            name: response.first_name,
            image: 'https://graph.facebook.com/' + response.id + '/picture'
        }));
        $avatar.show();

        ensureAppInit(function() {
            App.user.id = "fb-"+response.id;
            App.user.routines.url = "/users|"+App.user.id+"|routines"; // cannot use slashes because of backbone-couchdb's asumptions
            App.user.fetch({
                success: function(model, res) {
                    App.user.routines.fetch();
                },
                error: function(model, res) {
                    // new user here (expected res==404)
                    App.user.set({
                        _id: "fb-"+response.id,
                        facebook: response
                    });
                    if (wentThroughLanding) {
                        var attrs = App.newAttributes();
                        attrs.name = $('#page-landing .new-routine-picker').val();
                        App.user.routines.create(attrs);
                    }
                    App.user.save();
                }
            });
        });
    });
}


// initilization depends on facebook login state
// if we have no session => switch to stage 0
// if we have real session => switch to state 2

// stage 0 is landing screen which goes through stage 1 (connect button) to stage 2

window.fbAsyncInit = function() {
    FB.Event.subscribe('auth.sessionChange', function(response) {
        // ***
        processLoginEvent(response);
    });
    FB.Event.subscribe('fb.log', function(response) {
        // console.log('fb.log', arguments);
    });
    FB.init({
        appId: '101103209968654',
        cookie: true,
        status: true,
        xfbml: true
    });

    FB.getLoginStatus(function(response) {
        if (response.session) {
            // processLoginEvent(response.session);
            // see ***
        } else {
            switchStage(0);
        }
    });
};
(function() {
    var e = document.createElement('script');
    e.async = true;
    e.src = document.location.protocol + '//connect.facebook.net/en_US/all.js';
    document.getElementById('fb-root').appendChild(e);
} ());