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
      // "click .js-toolbar .js-selected-counter": "getSelectedGroup",
      "click .js-toolbar .js-deselect-all": "deselectAll",
      "click .js-toolbar .js-selected-counter": "selectAll",
      "click .js-toolbar .js-cut": "cutSelected",
      "click .js-toolbar .js-paste": "pasteSelected",
      "click .js-toolbar .js-delete": "deleteSelected",

      "click .js-create-folder": "createFolder",
      "change input[name=upload]": "changeEvent",
      "dragover": "dragoverEvent",
      "dragleave": "dragleaveEvent",
      "dragenter": "dragenterEvent",
      "dragmove": "dragenterEvent",
      "drop": "dropEvent"
    },
    initialize: function(options) {
      this.options = options || {};
    },
    render: function() {
      this.$el.html(this.template());

      this.$documents = this.$(".js-documents");

      this.documentListView = new views.DocumentList({
        el: this.$documents,
        collection: this.collection,
        filter: this.options.filter,
        isContextMenuEnabled: true,
        isSortable: true,
        isSelectable: false
      });

      return this;
    },

    selectAll: function(){
      this.collection.trigger("documents:selectAll")
    },
    deselectAll: function(){
      this.collection.trigger("documents:deselectAll")
    },
    getSelectedGroup: function(){
      this.collection.trigger("selected:test")
    },
    cutSelected: function(){
      this.collection.trigger("selected:cut")
    },
    pasteSelected: function(){
      this.collection.trigger("selected:paste")
    },
    deleteSelected: function(){
      this.collection.trigger("selected:delete")
    },

    openDoc: function(model) {
      this.documentListView.openDocument(model)
    },

    createFolder: function() {
      var documentFormModal
        , attrs = {
            type: "folder",
            parent_id: this.documentListView.model.get("id"),
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


    dragoverEvent: function(e) {
      e.originalEvent.preventDefault();
      var dt;
      dt = e.originalEvent.dataTransfer;
      if (!dt || !dt.files) {
        return true;
      }
      dt.dropEffect = "copy";
      return false;
    },

    dragleaveEvent: function(e) {
      if (this.$documents.is(e.target)){
        this.$documents.removeClass("is-dropped");
      }
    },

    dragenterEvent: function(e) {
      this.$documents.addClass("is-dropped");
      return false;
    },

    dropEvent: function(e) {
      e.originalEvent.preventDefault();
      var dt;
      this.$documents.removeClass("is-dropped");
      dt = e.originalEvent.dataTransfer;
      if (!dt || !dt.files) {
        return true;
      };
      this.uploadFiles(dt.files);
      return false;
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
