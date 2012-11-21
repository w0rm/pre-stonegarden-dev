define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/context_menu"], function ($, _, Backbone, sg) {

  var views = sg.views || (sg.views = {});


  views.BlockPlaceholder = Backbone.View.extend({

    className: "sg-placeholder js-placeholder",

    template: _.template($("#block-placeholder-template").html()),

    render: function() {
      this.$el.html(this.template());
      return this;
    }

  });


});
