define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/form"
      , "views/documents/list"
      , 'models/documents/documents'
      , 'models/documents/document'], function ($, _, Backbone, sg) {

  var views = sg.views
    , collections = sg.collections
    , models = sg.models
    , _GalleryBlockForm;


 _GalleryBlockForm = views.Form.extend({

    template: _.template($("#block-gallery-form-template").html()),
    galleryTemplate: _.template($("#block-gallery-template").html()),

    initialize: function(options) {
      this.options = options || {};
      this.attrs = this.options.attrs || {};
      this.folderId = 1; //TODO: change this setting;
      this.documents = new collections.Documents;
      if (this.hasModel()) {
        this.galleryAttributes = this.model.getGalleryAttributes()
        this.folderId = this.galleryAttributes.id;
      }
      this.gallery = new models.Document({id: this.folderId})
    },

    serializeObject: function() {
      var galleryAttributes = _.extend(
        this.gallery.toJSON(),
        sg.utils.serializeObject(this.$el)
      );
      return _.extend(
        this.attrs,
        {
          content: this.galleryTemplate({gallery: galleryAttributes})
        }
      );
    },

    getTemplateAttributes: function() {
      return this.hasModel() ?
      {
        block: this.model.toJSON(),
        gallery: this.galleryAttributes
      } :
      {
        block: {},
        gallery: {}
      }
    },

    render: function() {

      this.$el.html(this.template(this.getTemplateAttributes()));

      this.documentListView = new views.DocumentList({
        el: this.$(".js-documents"),
        filter: {type: "image"},
        isContextMenuEnabled: false,
        isSelectable: false,
        collection: this.documents
      })
        .on("document:open", this.openDocument, this);

      this.documents.on("reset", this.updateImages, this);

      this.gallery
        .on("change", this.documentListView.openDocument, this.documentListView)
        .fetch()

      return this;

    },

    updateImages: function() {
      images = this.documents.where({type: "image"})
      images = _.map(images, function(image) {
        return {
          id: image.get("id"),
          sizes: image.get("sizes"),
          src: image.get("src")
        }
      })
      this.gallery.set("images", images)
    },

    openDocument: function(model) {
      if (model.get("type") === "folder") {
        this.gallery = model;
      }
    }

  });


  views.GalleryBlockForm = Backbone.View.extend({

    initialize: function(options) {
      this.options = options || {};
      this.formView = new _GalleryBlockForm({
        model: this.model,
        collection: this.collection,
        attrs: this.options.attrs
      }).on("all", this.proxyEvent, this)
    },

    proxyEvent: function() {
      this.trigger.apply(this, arguments);
    },

    render: function() {
      new views.Modal({
        contentView: this.formView,
        sizeClass: "xlarge"
      }).open();
      return this;
    }

  });

  return views.GalleryBlockForm;

});
