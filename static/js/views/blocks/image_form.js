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
    , _ImageBlockForm;


 _ImageBlockForm = views.Form.extend({

    template: _.template($("#block-image-form-template").html()),
    imageTemplate: _.template($("#block-image-template").html()),

    initialize: function() {
      this.attrs = this.options.attrs || {};
      this.folderId = 1; //TODO: change this setting;

      if (this.hasModel()) {
        // TODO: ensure form doesnt work until we load this
        this.image = new models.Document({
          id: this.model.getImageAttributes().id
        })
        this.image.fetch();
      }

    },

    serializeObject: function() {
      var imageAttributes = _.extend(
        this.image.toJSON(),
        sg.utils.serializeObject(this.$el)
      );
      return _.extend(
        this.attrs,
        {
          content: this.imageTemplate({image: imageAttributes})
        }
      );
    },

    getTemplateAttributes: function() {
      return this.hasModel() ?
      {
        block: this.model.toJSON(),
        image: this.model.getImageAttributes()
      } :
      {
        block: {},
        image: {}
      }
    },

    render: function() {

      this.$el.html(this.template(this.getTemplateAttributes()));

      this.documentListView = new views.DocumentList({
        el: this.$(".js-documents"),
        filter: {type: "image"},
        isContextmenuEnabled: true
      })
        .on("document:select", this.selectDocument, this)

      new models.Document({id: this.folderId})
        .on("change", function(model) {
          this.documentListView.openDocument(model);
        }, this)
        .fetch()

      return this;

    },

    selectDocument: function(model) {
      this.image = model;
      this.$("[name=description]").val(model.get("title"));
    }

  });


  views.ImageBlockForm = Backbone.View.extend({

    initialize: function() {
      this.formView = new _ImageBlockForm({
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

  return views.ImageBlockForm;

});
