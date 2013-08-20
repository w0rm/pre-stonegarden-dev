define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "models/buffer"
      , "views/contextmenu"], function ($, _, Backbone, sg) {

  var views = sg.views
    , buffer = sg.buffer;


  // TODO: generate context menu using view
  views.BlockInserter = Backbone.View.extend({

    className: "sg-block-inserter js-inserter",

    template: _.template($("#block-inserter-template").html()),

    events: {
      "mousemove": "mousemoveEvent",
      "click .js-create": "createBlock",
      "click .js-paste": "pasteBlock"
    },

    initialize: function() {

      buffer.on("save:block", this.showPaste, this);

    },

    showPaste: function(key) {
      this.$(".js-paste").show()
    },

    hidePaste: function(key) {
      this.$(".js-paste").hide()
    },

    mousemoveEvent: function(e) {
      e.preventDefault();
    },

    render: function() {
      this.$el.html(this.template());
      if (buffer.has("block")) {
        this.showPaste();
      } else {
        this.hidePaste();
      }
      return this;
    },

    getPosition: function() {
      return this.$el.parent().children().index(this.el) + 1;
    },

    pasteBlock: function(e) {
      var block = buffer.load("block");
      console.log(block)
      e.preventDefault();
      _.extend(block, {position: this.getPosition()});
      this.trigger("block:paste", block);
    },

    createBlock: function(e) {
      var $link = $(e.currentTarget)
        , template = $link.data("template")
        , type = $link.data("type");

      e.preventDefault();

      this.trigger("block:create", {
        template: template,
        type: type,
        position: this.getPosition()
      });

    }

  });


});
