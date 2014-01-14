define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "models/documents/document"
      , "models/documents/documents"
      , "views/documents/document"
      , "jquery.ui"], function ($, _, Backbone, sg) {

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
      "dblclick .js-back": "openParent",
      // "dblclick .sg-document-folder": "openDocument",
      "sortupdate": "sortupdateEvent",
      "sortstart": "sortstartEvent"
    },

    initialize: function(options) {
      this.options = options || {};
      this.filter = this.options.filter || {};
      this.collection = this.collection || new collections.Documents;
      this.breadcrambs = {}; // reference tree of passed folders

      this.collection
        .on("add", this.appendDocument, this)
        .on("reset", this.render, this)
        .on("document:open", this.openDocument, this)
        // .on("all", function(eventName) {
        //   console.log('Collection event triggerred > ',eventName);
        // });


      if (this.options.isSelectable) {
        this.collection.on('change:isSelected', this.selectDocument, this)
      }

    },


    selectDocument: function(model, isSelected) {
      if (isSelected) {
        if (this.filter.type === model.get("type")) {
          this.trigger("document:select", model);
        } else {
          model.set('isSelected', false)
        }
      } else  {
        this.trigger("document:unselect", model)
      }
    },

    render: function() {
      this.$el.empty();
      if (this.model.get("parent_id")) {
        this.$el.append(this.backTemplate())
      };
      this.collection.each(this.appendDocument, this);

      if (this.options.isSortable) {
        this.$el.sortable({forcePlaceholderSize: true, items: '.sg-document'})
      }
      
      this.$el.parent().find('.sg-storage-title p').text(this.model.get('title'))
      return this;
    },
    makeItemView: function(model) {
      return new views.Document({
        model: model,
        isSelectable: this.options.isSelectable,
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
      //model = model || this.model;
      var data;
      if (model.get("type") === "folder") {
        this.collection.remove(model);
        this.model = model;
        this.collection.fetch({
          reset: true,
          data: _.extend({parent_id: model.get("id")}, this.filter)
        });
      } else if (model.get("type") === "image") {
        // trigger event on model to preview
        model.trigger("document:preview", model);
      }
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
    },

    sortstartEvent: function(e, ui) {
      // Fix the bug when placeholder doesn't get its height
      ui.placeholder.height(ui.helper.height())
    },

    sortupdateEvent: function(e, ui) {
      var docId = ui.item.data("id")
        , collection = this.collection
        , position = this.$el.children('.sg-document').index(ui.item) + 1
        , doc = collection.get(docId)
        // in backbone 1.1  The Collection methods add, remove, set, push, 
        // and shift now return the model (or models) added or removed from the collection 
        collection.remove(doc, {silent: true})
        collection.add(doc, {at: position - 1, silent: true})
        collection.each(function(m, index) {
          m.set({position: index + 1})
        })
      doc.save();
    }

  });

});
