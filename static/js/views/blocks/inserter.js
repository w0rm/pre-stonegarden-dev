define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/contextmenu"], function ($, _, Backbone, sg) {

  var views = sg.views;


  // TODO: generate context menu using view
  views.BlockInserter = Backbone.View.extend({

    className: "sg-block-inserter js-inserter",

    template: _.template($("#block-inserter-template").html()),

    events: {
      "mousemove": "mousemoveEvent",
      "click .js-create": "createBlock"
    },

    mousemoveEvent: function(e) {
      e.preventDefault();
    },

    render: function() {
      this.$el.html(this.template());
      return this;
    },

    createBlock: function(e) {
      var $link = $(e.currentTarget)
        , template = $link.data("template")
        , type = $link.data("type");

      e.preventDefault();

      this.trigger("block:create", {
        template: template,
        type: type,
        position: this.$el.parent().children().index(this.el) + 1
      });

    }

  });


});
