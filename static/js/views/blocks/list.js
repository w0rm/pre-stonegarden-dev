define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/modal"], function ($, _, Backbone, sg) {

  var views = sg.views;


  views.BlockList = Backbone.View.extend({

    render: function() {
      this.collection.each(this.addBlock, this);
      return this;
    },

    makeBlockView: function(block) {
      return new views.Block({model: block, el: block.get("html")})
        .on("contextmenu:show", this.propagateContextMenu, this)
        .on("inserter:show", this.propagateInserter, this)
        .render()
    },

    addBlock: function (model, collection, options) {
      this.appendBlock(model, options.index);
    },

    appendBlock: function(block, index) {
      var b = this.makeBlockView(block);
      if (_.isNumber(index)) {
        if (index === 0) {
          this.$el.prepend(b.el);
        } else {
          this.$el.children().eq(index - 1).after(b.el);
        }
      } else {
        // append if no index specified
        this.$el.append(b.el);
      }
      return this;
    },

    propagateContextMenu: function() {
      this.trigger("contextmenu:show");
    },

    propagateInserter: function() {
      this.trigger("inserter:show");
    }

  });



});
