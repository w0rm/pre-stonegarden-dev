define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/modal"
      , "views/block_inserter"
      , "views/block_placeholder"], function ($, _, Backbone, sg) {


  var collections = sg.collections
    , models = sg.models
    , views = sg.views || (sg.views = {});


  views.Blocks = Backbone.View.extend({

    render: function() {
      this.collection.each(this.appendBlock, this);
      return this;
    },

    appendBlock: function(block) {
      this.$el.append(
        new views.Block({model: block, el: block.get("html")})
          .on("block:contextmenu", this.propagateContextMenu, this)
          .render().el
      );
    },

    propagateContextMenu: function() {
      this.trigger("block:contextmenu");
    }

  });



});
