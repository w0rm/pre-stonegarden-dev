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

    className: "sg-document-storage",

    events: {
      "click .js-create-folder": "createFolder",
      "change input[name=upload]": "changeEvent"
    },

    initialize: function() {
      this.collection
        .on("document:open", this.openDocument, this)
    },

    openDocument: function(model) {
      if(model.get("type") === "folder") {
        this.navigateTo(model.get("id"));
      }
    },

    navigateTo: function(parent_id) {
      this.collection.parent_id = parent_id;
      this.collection.fetch({data: {parent_id: parent_id}});
    },

    render: function() {
      this.$el.html(this.template());

      this.documentListView = new views.DocumentList({
        el: this.$(".js-documents"),
        collection: this.collection
      }).render()

      return this;
    },

    createFolder: function() {
      var documentFormModal
        , attrs = {
            type: "folder",
            parent_id: this.collection.parent_id,
            position: 1
          };

      documentFormModal = new views.Modal({
        contentView: new views.DocumentForm({
          attrs: attrs,
          collection: this.collection
        })
      }).open();

    },

    changeEvent: function(e) {
      this.uploadFiles(e.target.files);
      // Empty file input value:
      e.target.outerHTML = e.target.outerHTML;
    },

    uploadFiles: function(files) {
      var position = this.collection.getUploadPosition();
      _.each(files, function(file) {
        this.documentListView.uploadFile(file, position);
      }, this);
      return this;
    }

  });

});
