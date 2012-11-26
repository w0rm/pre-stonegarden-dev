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
        .on("add", this.addDocument, this)
        .on("reset", this.render, this)
    },

    render: function() {
      this.collection.each(this.addDocument, this);
      return this;
    },

    makeItemView: function(model) {
      return new views.Document({model: model})
        .on("document:navigate", this.navigate, this)
        .render()
    },

    addDocument: function (model, collection, options) {
      this.appendDocument(model, options.index);
    },

    appendDocument: function(model, index) {
      var view = this.makeItemView(model);
      if (_.isNumber(index)) {
        if (index === 0) {
          this.$el.prepend(view.el);
        } else {
          this.$el.children().eq(index - 1).after(view.el);
        }
      } else {
        // append if no index specified
        this.$el.append(view.el);
      }
      return this;
    }

  });

});
