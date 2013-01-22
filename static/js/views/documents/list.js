define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "models/documents/document"
      , "models/documents/documents"
      , "views/documents/document"], function ($, _, Backbone, sg) {

  var utils = sg.utils
    , views = sg.views
    , collections = sg.collections
    , models = sg.models;


  views.DocumentList = Backbone.View.extend({

    loaderTemplate: _.template($("#document-loader-template").html()),
    backTemplate: _.template($("#document-back-template").html()),

    className: "sg-document-tiles",
    tagName: "ul",

    events: {
      "dblclick .js-back": "openParent"
    },

    initialize: function() {

      this.filter = this.options.filter || {};

      this.collection = this.collection || new collections.Documents;

      this.collection
        .on("add", this.appendDocument, this)
        .on("reset", this.render, this)
        .on("document:open", this.openDocument, this)

      if (this.options.isSelectable) {
        this.collection
          .on("document:select", this.selectDocument, this)
          .on("document:unselect", this.unselectDocument, this)
      }


    },

    selectDocument: function(model) {
      if (this.filter.type === model.get("type")) {
        this.trigger("document:select", model);
      } else {
        model.unselect();
      }
    },

    unselectDocument: function(model) {
      this.trigger("document:unselect", model);
    },

    render: function() {
      this.$el.empty();
      if (this.model.get("parent_id")) {
        this.$el.append(this.backTemplate())
      };
      this.collection.each(this.appendDocument, this);
      return this;
    },

    makeItemView: function(model) {
      return new views.Document({
        model: model,
        isContextMenuEnabled: this.options.isContextMenuEnabled
      }).render()
    },

    appendDocument: function(model, collection, options) {
      var view
        , index;
      if (model.get("parent_id") === this.model.get("id")) {
        view = this.makeItemView(model);
        index = options.index;
        this.insertAt(view.el, index);
      } else {
        this.collection.remove(model);
      }
      return this;
    },

    insertAt: function(el, index) {
      if (_.isNumber(index) && index < this.collection.length) {
          this.$el.children(":not(.js-back)").eq(index).before(el);
      } else {
        this.$el.append(el);
      }
    },

    uploadFile: function(file, position) {
      var filename = file.name.substr(0, file.name.lastIndexOf("."))
        , $load = $(this.loaderTemplate({filename: filename}));
      this.insertAt($load, position - 1);
      this.collection.create({
        upload: file,
        parent_id: this.model.get("id"),
        position: position
      }, {
        wait: true,
        at: position - 1,
        complete: function() { $load.remove(); }
      });
      return this;
    },

    openDocument: function(model) {
      var data;
      if (model.get("type") === "folder") {
        this.collection.remove(model);
        this.model = model;
        this.collection.fetch({
          data: _.extend({parent_id: model.get("id")}, this.filter)
        });
      };
      this.trigger("document:open", model);
      return this;
    },

    openParent: function() {
      var folder_id = this.model.get("parent_id")
        , folder = new models.Document({id: folder_id})
            .on("change", function(model) {
              this.collection.trigger("document:open", model);
            }, this)
            .fetch();
    }

  });

});
