//
// window.App
// window.User
// 
// User has many Routines
// Routines is collection of Routine
//
// User
//  - id
//  - facebook (info hash)
//  - start_day (dindex)
//
// Routine
//  - name
//  - checkins (hash of jsons, indexed by dindex)
//
// Today (dindex)

var dayTable = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

Date.prototype.getD = function() {
    return Math.floor(this.valueOf() / (1000*60*60*24));
}

var newD = function(d) {
    return new Date(d*(1000*60*60*24));
}

window.stage = 0;


window.refDay = 15018 - 7; // hacks
window.today = 15018 - 1;

function xreset() {
    localStorage.setItem('user', null);
    localStorage.setItem('routines', null);
}

function resetSession() {
    FB.logout(function(response) {
        // user is now logged out
        $.cookie("21session", null);
        xreset();
        location.reload();
    });
}

function initStage() {
    var session = $.cookie("21session");
    if (!session) {
        switchStage(0);
    } else {
        // TODO: pass user session
    }
}

var initedStages = {};
var wentThroughLanding = false;
function switchStage(stage) {
    console.log('switchStage: ', stage)
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
            // $('.add-angels').bind('click', function() {
            //     addAnglelsAction();
            // });
        }
    }

    $('body').get(0).className = 'selected-stage-'+stage;
    
    window.stage = stage;
    $('.stage').hide();
    $('.stage-'+stage).show();
    
}

var pendingTasks = [];
window.ensureAppInit = function(fn) {
    if (!window.App) {
        pendingTasks.push(fn);
    } else {
        fn();
    }
}

$(function() {
    
    window.Connector = {
        userUrl: function() {
            return "/users/"+0; // App.user.id;
        },
        
        push: function() {
            var userJSON = App.user.toJSON();
            var routinesJSON = App.user.routines.toJSON();
            var json = userJSON;
            json.routines = routinesJSON;
            console.log('push', json);
            
            $.ajax({
                type: "POST",
                url: this.userUrl(),
                data: json,
                success: function(json) {
                }, 
                error: function() {
                }
            });
            
            $.post(this.userUrl(), json, function(data){
                console.log('push done', data);
            }, "json");
        },
         
        pull: function(success, error) {
            console.log('pull');
            $.getJSON(this.userUrl(), function(data) {
                console.log('pull here', data);
            });
        }
    };
    
    var plannedPush;
    
    Backbone.sync = function(method, model, success, error) {
        var resp;
        var store = model.localStorage || model.collection.localStorage;
    
        console.log('sync', method, model, store.name);
    
        switch (method) {
            case "read":    resp = model.id ? store.find(model) : store.findAll(); break;
            case "create":  resp = store.create(model);                            break;
            case "update":  resp = store.update(model);                            break;
            case "delete":  resp = store.destroy(model);                           break;
        }
        
        if (method=="read") {
            Connector.pull(function() {
                if (store.name=="routines") {
                    
                }
            }, function() {
                // TODO:
            });
        } else {
            if (!plannedPush) {
                plannedPush = setTimeout(function() {
                    plannedPush = null;
                    Connector.push();
                }, 200);
            }
        }
    
        if (resp) {
            success(resp);
        } else {
            error("Record not found");
        }
    };
    
    window.User = Backbone.Model.extend({
        localStorage: new Store("user"),
        
        initialize: function() {
            _.bindAll(this, 'addOne', 'addAll');

            if (!this.get("id")) {
                var tempId = "temp"+(Math.random()+"").substring(2);
                console.log('no id, generating temporary user', tempId);
                this.set({
                    "id": tempId
                });
            }
            
            if (!this.get("start_day")) {
                this.set({
                    "start_day": 15018 - 7, 
                });
            }
            
            this.routines = new RoutineList;

            this.routines.bind('add', this.addOne);
            this.routines.bind('refresh', this.addAll);

            this.routines.fetch();
        },

        addOne: function(routine) {
            var view = new RoutineView({
                model: routine,
                firstDay: refDay
            });
            $(".routine-list").append(view.render().el);
        },

        addAll: function() {
            console.log('addAll');
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

        toggle: function() {
            this.save({
                done: !this.get("done")
            });
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
            //checkins = _.clone(checkins);
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
            this.trigger('change');
        },
        
        clear: function() {
            this.destroy();
            this.view.remove();
        }
    });

    window.RoutineList = Backbone.Collection.extend({
        model: Routine,
        localStorage: new Store("routines"),

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
            if (this.model.isDayChecked(this.options.dindex)) $(this.el).addClass('checked');
            if (this.options.dindex==window.today) $(this.el).addClass('today');
            return this;
        },

        check: function() {
            console.log('checked', this.model.id, this.options.dindex);
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
            var monthDay = date.getDate()+1;
            var dayString = dayTable[dayNum];
            var shortDate = monthDay+"."+month+".";
            
            if (this.options.dindex==window.today) $(this.el).addClass('today');
            
            $(this.el).html(this.template({
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
            "click div.routine-name": "showProps",
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
        
        showProps: function() {
            $(this.el).find('.props').toggle();
        },

        clear: function() {
            this.model.clear();
        }
    });

    window.AppView = Backbone.View.extend({
        el: $("#dayapp"),
        statsTemplate: _.template($('#stats-template').html()),
        events: {
            "keypress .new-routine": "createOnEnter",
            "keydown .new-routine": "handleEsc",
            "keypress .new-routine-frequency": "createOnEnter",
            "click .routine-clear a": "clearCompleted"
        },

        initialize: function() {

            _.bindAll(this, 'render');
            
            this.$input = this.$(".new-routine");
            this.$frequency = this.$(".new-routine-frequency");
            
            this.resetUser();
        },
        
        resetUser: function() {
            this.user = new User();
            this.user.routines.bind('all', this.render);
            this.user.bind('all', this.render);
        },
        
        computeInitialViewDay: function(dtoday) {
            var startDay = this.user.get('start_day');
            var daysSinceBeginning = dtoday - startDay;
            var weeksSinceBeginning = Math.floor(daysSinceBeginning / 7);
            return startDay + (weeksSinceBeginning * 7);
        },

        render: function() {
            this.$('.stats').html(this.statsTemplate({
                total: this.user.routines.length,
                remaining: this.user.routines.remaining().length
            }));
            
            this.options.firstViewDay = this.computeInitialViewDay(refDay);
            
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
            console.log(e.keyCode);
            if (e.keyCode==27) {
                console.log(e);
                $('.addnew-button').show();
                $('#page-standard .create-routine').hide();
            }
        }

        // Lazily show the tooltip that tells you to press `enter` to save a new day item, after one second.
        // showTooltip: function(e) {
        //     var tooltip = this.$(".ui-tooltip-top");
        //     var val = this.$input.val();
        //     tooltip.fadeOut();
        //     if (this.tooltipTimeout) clearTimeout(this.tooltipTimeout);
        //     if (val == '' || val == this.$input.attr('placeholder')) return;
        //     var show = function() {
        //         tooltip.show().fadeIn();
        //     };
        //     this.tooltipTimeout = _.delay(show, 1000);
        // }
    });

    window.Today = new Date().getD();
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
    
    // logged in and connected user, someone you know
    console.log('fb user logged', response);

    FB.api('/me', function(response) {
        var $avatar = $('.fb-avatar');
        console.log('user data', response);
        var template = _.template($('#avatar-template').html());
        $avatar.html(template({
            name: response.first_name,
            image: 'https://graph.facebook.com/' + response.id + '/picture'
        }));

        $avatar.show();

        ensureAppInit(function() {
            App.user.set({
                'facebook': response,
                'id': response.id
            });
            App.user.save();
            
            if (wentThroughLanding) {
                var attrs = App.newAttributes();
                attrs.name = $('#page-landing .new-routine-picker').val();
                App.user.routines.create(attrs);
                App.user.save();
            }
        });
    });
}

window.fbAsyncInit = function() {
    FB.Event.subscribe('auth.sessionChange', function(response) {
        console.log('auth.sessionChange', arguments);
        processLoginEvent(response);
    });
    FB.Event.subscribe('fb.log', function(response) {
        console.log('fb.log', arguments);
    });
    FB.init({
        appId: '101103209968654',
        cookie: true,
        status: true,
        xfbml: true
    });

    FB.getLoginStatus(function(response) {
        if (response.session) {
            processLoginEvent(response.session);
        } else {
            switchStage(0);
        }
    });
};
(function() {
    var e = document.createElement('script');
    e.async = true;
    e.src = document.location.protocol + '//static.ak.fbcdn.net/connect/en_US/core.debug.js';
    //         '//connect.facebook.net/en_US/all.js';
    document.getElementById('fb-root').appendChild(e);
} ());