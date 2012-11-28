define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/documents/document"], function ($, _, Backbone, sg) {

  var utils = sg.utils
    , views = sg.views;


  views.DocumentList = Backbone.View.extend({

    initialize: function() {
      this.collection
        .on("add", this.appendDocument, this)
        .on("reset", this.render, this)
        .on("document:open", this.openDocument, this)
    },

    render: function() {
      this.$el.empty();
      this.collection.each(this.appendDocument, this);
      return this;
    },

    makeItemView: function(model) {
      return new views.Document({model: model}).render()
    },

    appendDocument: function(model, collection, options) {
      var view = this.makeItemView(model)
        , index = options.index;
      this.insertAt(view.el, index);
      return this;
    },

    insertAt: function(el, index) {
      if (_.isNumber(index)) {
        if (index === 0) {
          this.$el.prepend(el);
        } else {
          this.$el.children().eq(index - 1).after(el);
        }
      } else {
        // append if no index specified
        this.$el.append(el);
      }
    },

    uploadFile: function(file, position) {
      var $load = $("<li class='sg-document-loader'>" +
                      "<span class='sg-document-title'>" +
                        file.name.substr(0, file.name.lastIndexOf(".")) +
                      "</span>" +
                    "</li>");
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
      if (model.get("type") === "folder") {
        this.collection.remove(model);
        this.model = model;
        this.collection.fetch({data: {parent_id: model.get("id")}});
      };
      return this;
    },


  });

});
