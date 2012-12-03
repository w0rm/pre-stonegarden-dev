define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"], function ($, _, Backbone, sg) {

  var views = sg.views || (sg.views = {});


  views.PageDelete = Backbone.View.extend({

    template: _.template($("#page-delete-template").html()),

    events: {
      "click .js-ok": "deletePage",
      "click .js-cancel": "closeModal"
    },

    render: function() {
      this.$el.html(this.template());
      return this;
    },

    deletePage: function(e) {
      this.model.destroy({wait: true});
      this.trigger("modal:close");
    },

    closeModal: function(e) {
      this.trigger("modal:close");
    }

  });


});
