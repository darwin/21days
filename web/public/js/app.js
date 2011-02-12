// Load the application once the DOM is ready, using `jQuery.ready`:
$(function() {

    // Day Model
    // ----------
    // Our basic **Day** model has `content`, `order`, and `done` attributes.
    window.Day = Backbone.Model.extend({

        // If you don't provide a day, one will be provided for you.
        EMPTY: "empty day...",

        // Ensure that each day created has `content`.
        initialize: function() {
            if (!this.get("content")) {
                this.set({
                    "content": this.EMPTY
                });
            }
        },

        // Toggle the `done` state of this day item.
        toggle: function() {
            this.save({
                done: !this.get("done")
            });
        },

        // Remove this Day from *localStorage* and delete its view.
        clear: function() {
            this.destroy();
            this.view.remove();
        }

    });

    // Day Collection
    // ---------------
    // The collection of days is backed by *localStorage* instead of a remote
    // server.
    window.DayList = Backbone.Collection.extend({

        // Reference to this collection's model.
        model: Day,

        // Save all of the day items under the `"days"` namespace.
        localStorage: new Store("days"),

        // Filter down the list of all day items that are finished.
        done: function() {
            return this.filter(function(day) {
                return day.get('done');
            });
        },

        // Filter down the list to only day items that are still not finished.
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
        comparator: function(day) {
            return day.get('order');
        }

    });

    // Create our global collection of **Days**.
    window.Days = new DayList;

    // Day Item View
    // --------------
    // The DOM element for a day item...
    window.DayView = Backbone.View.extend({

        //... is a list tag.
        tagName: "li",

        // Cache the template function for a single item.
        template: _.template($('#item-template').html()),

        // The DOM events specific to an item.
        events: {
            "click .check": "toggleDone",
            "dblclick div.day-content": "edit",
            "click span.day-destroy": "clear",
            "keypress .day-input": "updateOnEnter"
        },

        // The DayView listens for changes to its model, re-rendering. Since there's
        // a one-to-one correspondence between a **Day** and a **DayView** in this
        // app, we set a direct reference on the model for convenience.
        initialize: function() {
            _.bindAll(this, 'render', 'close');
            this.model.bind('change', this.render);
            this.model.view = this;
        },

        // Re-render the contents of the day item.
        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            this.setContent();
            return this;
        },

        // To avoid XSS (not that it would be harmful in this particular app),
        // we use `jQuery.text` to set the contents of the day item.
        setContent: function() {
            var content = this.model.get('content');
            this.$('.day-content').text(content);
            this.input = this.$('.day-input');
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

        // Close the `"editing"` mode, saving changes to the day.
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
            "keypress #new-day": "createOnEnter",
            "keyup #new-day": "showTooltip",
            "click .day-clear a": "clearCompleted"
        },

        // At initialization we bind to the relevant events on the `Days`
        // collection, when items are added or changed. Kick things off by
        // loading any preexisting days that might be saved in *localStorage*.
        initialize: function() {
            _.bindAll(this, 'addOne', 'addAll', 'render');

            this.input = this.$("#new-day");

            Days.bind('add', this.addOne);
            Days.bind('refresh', this.addAll);
            Days.bind('all', this.render);

            Days.fetch();
        },

        // Re-rendering the App just means refreshing the statistics -- the rest
        // of the app doesn't change.
        render: function() {
            var done = Days.done().length;
            this.$('#day-stats').html(this.statsTemplate({
                total: Days.length,
                done: Days.done().length,
                remaining: Days.remaining().length
            }));
        },

        // Add a single day item to the list by creating a view for it, and
        // appending its element to the `<ul>`.
        addOne: function(day) {
            var view = new DayView({
                model: day
            });
            this.$("#day-list").append(view.render().el);
        },

        // Add all items in the **Days** collection at once.
        addAll: function() {
            Days.each(this.addOne);
        },

        // Generate the attributes for a new Day item.
        newAttributes: function() {
            return {
                content: this.input.val(),
                order: Days.nextOrder(),
                done: false
            };
        },

        // If you hit return in the main input field, create new **Day** model,
        // persisting it to *localStorage*.
        createOnEnter: function(e) {
            if (e.keyCode != 13) return;
            Days.create(this.newAttributes());
            this.input.val('');
        },

        // Clear all done day items, destroying their models.
        clearCompleted: function() {
            _.each(Days.done(), function(day) {
                day.clear();
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
