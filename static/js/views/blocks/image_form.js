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

    initialize: function(options) {
      this.options = options || {};
      this.attrs = this.options.attrs || {};
      this.folderId = 1; //TODO: change this setting;
      if (this.hasModel()) {
        this.imageAttributes = this.model.getImageAttributes()
        this.folderId = this.imageAttributes.parent_id;
        //TODO: set this on document list load
        this.image = new models.Document({id: this.imageAttributes.id});
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
        image: this.imageAttributes
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
        isContextMenuEnabled: false,
        isSelectable: true
      })
        .on("document:open", this.openDocument, this)  //double-click shortcut
        .on("document:chosen", this.chooseDocument, this)  //click  
        
      new models.Document({id: this.folderId})
        .on("change", function(model) {
          this.documentListView.openDocument(model);
        }, this)
        .fetch()

      return this;

    },


    openDocument: function(model) {
      if (model.get("type") === "image") {
        this.chooseDocument(model);
        this.submit();
      }
    },

    chooseDocument: function(model) {
      this.image = model;
      this.$("[name=description]").val(model.get("title"));
    },

    unchooseDocument: function(model) {
      if (this.image === model) {
        this.image = null;
        this.$("[name=description]").val("");
      }
    }

  });


  views.ImageBlockForm = Backbone.View.extend({

    initialize: function(options) {
      this.options = options || {};
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
