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

$(function() {
    
    window.currentUserId = null;
    
    Date.prototype.getD = function() {
        return Math.floor(this.valueOf() / (1000*60*60*24));
    }
    
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
            this.routines.url = "/users/"+this.id+"/routines";

            this.routines.bind('add', this.addOne);
            this.routines.bind('refresh', this.addAll);
            this.routines.bind('change', this.resave);

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
        },

        resave: function() {
            this.save({'routines': this.routines.toJSON()});
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
            checkins = _.clone(checkins);
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
        template: _.template($('#day-template').html()),
        events: {
            "click": "check",
        },

        initialize: function() {
            _.bindAll(this, 'render', 'check');
        },

        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            if (this.model.isDayChecked(this.options.dindex)) $(this.el).addClass('checked');
            return this;
        },

        check: function() {
            console.log('checked', this, this.options.dindex);
            this.model.toggleDayCheckin(this.options.dindex);
            this.model.save();
        }

    });

    window.WeekView = Backbone.View.extend({
        className: 'week',
        template: _.template($('#week-template').html()),
        events: {
        },

        initialize: function() {
            _.bindAll(this, 'render');
        },

        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            
            var root = $(this.el);
            for (var i=0; i<7; i++) {
                var day = new DayView({
                    model: this.model,
                    dindex: this.options.dindex + i
                });
                day.render();
                root.append(day.el);
            }
            
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
            
            this.$('.routine-weeks').empty().append(week1.el, week2.el, week3.el);
            
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

        // Toggle the `"done"` state of the model.
        toggleDone: function() {
            this.model.toggle();
        },

        // Switch this view into `"editing"` mode, displaying the input field.
        edit: function() {
            $(this.el).addClass("editing");
            this.$input.focus();
        },

        // If you hit `enter`, we're through editing the item.
        updateOnEnter: function(e) {
            if (e.keyCode == 13) this.close();
        },

        // Remove this view from the DOM.
        remove: function() {
            $(this.el).remove();
        },

        // Remove the item, destroy the model.
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
            this.user = window.User;
            this.user.routines.bind('all', this.render);
            this.user.bind('all', this.render);
        },

        render: function() {
            var done = this.user.routines.done().length;
            this.$('#stats').html(this.statsTemplate({
                total: this.user.routines.length,
                done: this.user.routines.done().length,
                remaining: this.user.routines.remaining().length
            }));
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
    window.User = new User();
    window.App = new AppView;
});