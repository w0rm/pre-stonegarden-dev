define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"], function ($, _, Backbone, sg) {

  var views = sg.views || (sg.views = {});


  views.BlockPlaceholder = Backbone.View.extend({

    className: "sg-block-placeholder js-placeholder",

    template: _.template($("#block-placeholder-template").html()),

    events: {
      "click": "createBlock"
    },

    render: function() {
      this.$el.html(this.template());
      return this;
    },

    createBlock: function(e) {
      e.preventDefault();
      this.trigger("block:create", {
        template: "content",
        type: "wysiwyg",
        position: 1
      });
    }

  });


});
