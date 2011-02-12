// Load the application once the DOM is ready, using `jQuery.ready`:
$(function() {

    window.Routine = Backbone.Model.extend({

        EMPTY: "empty routine...",

        initialize: function() {
            if (!this.get("content")) {
                this.set({
                    "content": this.EMPTY
                });
            }
        },

        toggle: function() {
            this.save({
                done: !this.get("done")
            });
        },

        clear: function() {
            this.destroy();
            this.view.remove();
        }

    });

    window.RoutineList = Backbone.Collection.extend({

        // Reference to this collection's model.
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

        // We keep the Days in sequential order, despite being saved by unordered
        // GUID in the database. This generates the next order number for new items.
        nextOrder: function() {
            if (!this.length) return 1;
            return this.last().get('order') + 1;
        },

        // Days are sorted by their original insertion order.
        comparator: function(routine) {
            return routine.get('order');
        }

    });

    window.Routines = new RoutineList;

    window.RoutineView = Backbone.View.extend({

        //... is a list tag.
        tagName: "li",

        // Cache the template function for a single item.
        template: _.template($('#routine-template').html()),

        // The DOM events specific to an item.
        events: {
            "click .check": "toggleDone",
            "dblclick div.routine-content": "edit",
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
            return this;
        },

        setContent: function() {
            var content = this.model.get('content');
            this.$('.routine-content').text(content);
            this.input = this.$('.routine-input');
            this.input.bind('blur', this.close);
            this.input.val(content);
        },

        // Toggle the `"done"` state of the model.
        toggleDone: function() {
            this.model.toggle();
        },

        // Switch this view into `"editing"` mode, displaying the input field.
        edit: function() {
            $(this.el).addClass("editing");
            this.input.focus();
        },

        close: function() {
            this.model.save({
                content: this.input.val()
            });
            $(this.el).removeClass("editing");
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

    // The Application
    // ---------------
    // Our overall **AppView** is the top-level piece of UI.
    window.AppView = Backbone.View.extend({

        // Instead of generating a new element, bind to the existing skeleton of
        // the App already present in the HTML.
        el: $("#dayapp"),

        // Our template for the line of statistics at the bottom of the app.
        statsTemplate: _.template($('#stats-template').html()),

        // Delegated events for creating new items, and clearing completed ones.
        events: {
            "keypress #new-routine": "createOnEnter",
            "keyup #new-routine": "showTooltip",
            "click .routine-clear a": "clearCompleted"
        },

        // At initialization we bind to the relevant events on the `Days`
        // collection, when items are added or changed. Kick things off by
        // loading any preexisting days that might be saved in *localStorage*.
        initialize: function() {
            _.bindAll(this, 'addOne', 'addAll', 'render');

            this.input = this.$("#new-routine");

            Routines.bind('add', this.addOne);
            Routines.bind('refresh', this.addAll);
            Routines.bind('all', this.render);

            Routines.fetch();
        },

        // Re-rendering the App just means refreshing the statistics -- the rest
        // of the app doesn't change.
        render: function() {
            var done = Routines.done().length;
            this.$('#stats').html(this.statsTemplate({
                total: Routines.length,
                done: Routines.done().length,
                remaining: Routines.remaining().length
            }));
        },

        addOne: function(routine) {
            var view = new RoutineView({
                model: routine
            });
            this.$("#routine-list").append(view.render().el);
        },

        addAll: function() {
            Routines.each(this.addOne);
        },

        newAttributes: function() {
            return {
                content: this.input.val(),
                order: Routines.nextOrder(),
                done: false
            };
        },

        createOnEnter: function(e) {
            if (e.keyCode != 13) return;
            Routines.create(this.newAttributes());
            this.input.val('');
        },

        clearCompleted: function() {
            _.each(Routines.done(), function(routine) {
                routine.clear();
            });
            return false;
        },

        // Lazily show the tooltip that tells you to press `enter` to save
        // a new day item, after one second.
        showTooltip: function(e) {
            var tooltip = this.$(".ui-tooltip-top");
            var val = this.input.val();
            tooltip.fadeOut();
            if (this.tooltipTimeout) clearTimeout(this.tooltipTimeout);
            if (val == '' || val == this.input.attr('placeholder')) return;
            var show = function() {
                tooltip.show().fadeIn();
            };
            this.tooltipTimeout = _.delay(show, 1000);
        }

    });

    // Finally, we kick things off by creating the **App**.
    window.App = new AppView;

});