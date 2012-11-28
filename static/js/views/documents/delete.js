define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"], function ($, _, Backbone, sg) {

  var views = sg.views || (sg.views = {});


  views.DocumentDelete = Backbone.View.extend({

    template: _.template($("#document-delete-template").html()),

    events: {
      "click .js-ok": "deleteDocument",
      "click .js-cancel": "closeModal"
    },

    render: function() {
      this.$el.html(this.template());
      return this;
    },

    deleteDocument: function(e) {
      this.model.destroy();
      this.trigger("modal:close");
    },

    closeModal: function(e) {
      this.trigger("modal:close");
    }

  });


});
