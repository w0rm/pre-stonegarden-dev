define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/modal"
      , "views/block_inserter"
      , "views/block_placeholder"], function ($, _, Backbone, sg) {


  var views = sg.views;


  views.Blocks = Backbone.View.extend({

    render: function() {
      this.collection.each(this.appendBlock, this);
      return this;
    },

    makeBlockView: function(block) {
      return new views.Block({model: block, el: block.get("html")})
        .on("block:contextmenu", this.propagateContextMenu, this)
        .render()
    },

    appendBlock: function(block) {
      this.$el.append(this.makeBlockView(block).el);
      return this;
    },

    insertBlock: function(block, el) {
      var b = this.makeBlockView(block);

      console.log(b.el);

      b.$el.insertAfter(el);
      return this;
    },

    propagateContextMenu: function() {
      this.trigger("block:contextmenu");
    }

  });



});
