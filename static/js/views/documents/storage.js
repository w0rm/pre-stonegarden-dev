define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/modal"
      , "views/documents/form"
      , "views/documents/list"], function ($, _, Backbone, sg) {

  var utils = sg.utils
    , views = sg.views;

  views.DocumentStorage = Backbone.View.extend({

    template: _.template($("#document-storage-template").html()),

    events: {
      "click .js-create-folder": "createFolder"
    },

    navigateTo: function(parent_id) {
      this.parent_id = parent_id;
      this.collection.fetch({data: {parent_id: parent_id}});
    },

    render: function() {
      this.$el.html(this.template());

      new views.DocumentList({
        el: this.$(".js-documents"),
        collection: this.collection
      }).render()

      return this;
    },


    createFolder: function() {
      var documentForm
        , documentFormModal
        , attrs = {
            type: "folder",
            parent_id: this.parent_id,
            position: 1
          };

      documentForm = new views.DocumentForm({
        attrs: attrs,
        collection: this.collection
      });

      documentFormModal = new views.Modal({
        contentView: documentForm
      }).open();

    }


  });

});
