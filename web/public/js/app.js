//
// window.App
// window.User
// 
// User has many Routines
// Routines is collection of Routine
//
// User
//  - id
//  - facebook (info)
//  - start_day (dindex)
//
// Routine
//  - name
//  - checkins (hash of jsons, indexed by dindex)
//
// Today (dindex)

var pendingTasks = [];
window.ensureAppInit = function(fn) {
    if (!window.App) {
        pendingTasks.push(fn);
    } else {
        fn();
    }
}

$(function() {
    
    var dayTable = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    
    window.currentUserId = null;
        
    Date.prototype.getD = function() {
        return Math.floor(this.valueOf() / (1000*60*60*24));
    }

    var newD = function(d) {
        return new Date(d*(1000*60*60*24));
    }
    
    window.Connector = {
        userUrl: function() {
            return "/users/"+App.user.id;
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
            
            // $.post(this.userUrl(), json, function(data){
            //     console.log('push done', data);
            // }, "json");
        },
         
        pull: function(success, error) {
            console.log('pull');
            $.getJSON(this.userUrl(), function(data) {
                console.log('pull here', data);
            });
        }
    };
    
    var plannedPush;
    
    // Backbone.sync = function(method, model, success, error) {
    //     var resp;
    //     var store = model.localStorage || model.collection.localStorage;
    // 
    //     console.log('sync', method, model, store.name);
    // 
    //     switch (method) {
    //         case "read":    resp = model.id ? store.find(model) : store.findAll(); break;
    //         case "create":  resp = store.create(model);                            break;
    //         case "update":  resp = store.update(model);                            break;
    //         case "delete":  resp = store.destroy(model);                           break;
    //     }
    //     
    //     if (method=="read") {
    //         Connector.pull(function() {
    //             if (store.name=="routines") {
    //                 
    //             }
    //         }, function() {
    //             // TODO:
    //         });
    //     } else {
    //         if (!plannedPush) {
    //             plannedPush = setTimeout(function() {
    //                 plannedPush = null;
    //                 Connector.push();
    //             }, 200);
    //         }
    //     }
    // 
    //     if (resp) {
    //         success(resp);
    //     } else {
    //         error("Record not found");
    //     }
    // };
    
    window.User = Backbone.Model.extend({
        localStorage: new Store("user"),
        
        initialize: function() {
            _.bindAll(this, 'addOne', 'addAll', 'resave');
            
            if (!this.get("start_day")) {
                this.set({
                    "start_day": new Date().getD()
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
                firstDay: this.get('start_day')
            });
            $("#routine-list").append(view.render().el);
        },

        addAll: function() {
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
            _.bindAll(this, 'render', 'check');
        },

        render: function() {
            if (this.model.isDayChecked(this.options.dindex)) $(this.el).addClass('checked');
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
            "click .check": "toggleDone",
            "dblclick div.routine-name": "edit",
            "click span.routine-destroy": "clear",
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

        toggleDone: function() {
            this.model.toggle();
        },

        edit: function() {
            $(this.el).addClass("editing");
            this.$input.focus();
        },

        updateOnEnter: function(e) {
            if (e.keyCode == 13) this.close();
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
        statsTemplate: _.template($('#stats-template').html()),
        events: {
            "keypress #new-routine": "createOnEnter",
            "keypress #new-routine-frequency": "createOnEnter",
            "click .routine-clear a": "clearCompleted"
        },

        initialize: function() {

            _.bindAll(this, 'render');
            
            this.$input = this.$("#new-routine");
            this.$frequency = this.$("#new-routine-frequency");
            
            var date = new Date();
            
            this.today = date.getD();
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
            var done = this.user.routines.done().length;
            this.$('#stats').html(this.statsTemplate({
                total: this.user.routines.length,
                done: this.user.routines.done().length,
                remaining: this.user.routines.remaining().length
            }));
            
            this.options.firstViewDay = this.computeInitialViewDay(this.today);
            
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
            
            $('#routines').show();
        },

        newAttributes: function() {
            return {
                name: this.$input.val(),
                frequency: parseInt(this.$frequency.val().substring(1), 10), //  f1, f3 or f7
                order: this.user.routines.nextOrder(),
                done: false
            };
        },

        createOnEnter: function(e) {
            if (e.keyCode != 13) return;
            this.user.routines.create(this.newAttributes());
            this.$input.val('');
        },

        clearCompleted: function() {
            _.each(this.user.routines.done(), function(routine) {
                routine.clear();
            });
            return false;
        },
        
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