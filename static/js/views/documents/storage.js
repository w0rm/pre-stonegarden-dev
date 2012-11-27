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

    },

    changeEvent: function(e) {
      this.upload(e.target.files);
      // Empty file input value:
      e.target.outerHTML = e.target.outerHTML;
    },

    upload: function(files) {
      var position = this.collection.getUploadPosition();
      _.each(files, function(file) {
        this.collection.create({
          upload: file,
          parent_id: this.parent_id,
          position: position
        }, {wait: true, at: position - 1});
      }, this);
      return this;
    }

  });

});
