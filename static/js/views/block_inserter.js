define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/context_menu"], function ($, _, Backbone, sg) {

  var views = sg.views || (sg.views = {});


  views.BlockInserter = Backbone.View.extend({

    className: "sg-block-inserter js-inserter",

    template: _.template($("#block-inserter-template").html()),

    events: {
      "mousemove": "mousemoveEvent"
    },

    mousemoveEvent: function(e) {
      e.preventDefault();
    },

    render: function() {
      this.$el.html(this.template());
      return this;
    }

  });


});
