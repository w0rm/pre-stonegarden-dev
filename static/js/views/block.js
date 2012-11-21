define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/contextmenu"
      , "views/modal"
      , "views/blocks"
      , "views/blocks_editable"
      , "views/block_delete"
      , "models/block"], function ($, _, Backbone, sg) {


  var collections = sg.collections
    , models = sg.models
    , views = sg.views;


  views.Block = Backbone.View.extend({

    events: {
      "mouseenter": "showContextMenu",
      "mouseleave": "hideContextMenu"
    },

    initialize: function() {
      this.contextMenu = new views.ContextMenu({model: this.model});
      this.model
        .on("block:highlight", this.highlightBlock, this)
        .on("block:lowlight", this.lowlightBlock, this)
        .on("block:delete", this.deleteBlock, this)
        .on("destroy", this.remove, this)
    },

    highlightBlock: function() {
      this.$el.addClass("sg-block-highlight");
    },

    lowlightBlock: function() {
      this.$el.removeClass("sg-block-highlight");
    },

    deleteBlock: function() {
      new views.Modal({
        contentView: new views.BlockDelete({model: this.model})
      }).open()
    },

    render: function() {
      var self = this;

      this.$blocks = this.$(".js-blocks");

      // Append template blocks
      this.$(".js-template-block").each(function() {
        var $block = $(this)
          , block_name = $block.data("name")
          , block = sg.templateBlocks.find(function(b) {
              return b.get("name") === block_name
            });
        if (block) {
          new views.Block({model: block, el: block.get("html")})
            .on("block:contextmenu", self.propagateContextMenu, self)
            .render().$el.appendTo($block);
        }
      });

      // Render blocks
      if (this.model.isContainer()) {
        this.blocks = new views.BlocksEditable({
          el: this.$blocks,
          collection: this.model.blocks
        })
          .on("block:contextmenu", this.propagateContextMenu, this)
          .render()
      } else if (this.model.blocks.length) {
        this.blocks = new views.Blocks({
          el: this.$blocks,
          collection: this.model.blocks
        })
          .on("block:contextmenu", this.propagateContextMenu, this)
          .render()
      }

      return this;
    },

    showContextMenu: function(e) {
      if (this.model.hasContextMenu()) {
        e.stopPropagation()
        this.$el.prepend(this.contextMenu.render().el);
        this.trigger("block:contextmenu");
      }
    },

    hideContextMenu: function(e) {
      if (this.model.hasContextMenu()) {
        this.contextMenu.$el.detach();
      }
    },

    propagateContextMenu: function() {
      this.hideContextMenu();
      this.trigger("block:contextmenu");
    },

    editBlock: function(e) {
      var $block = $(e.currentTarget);
      e.stopPropagation();
      // edit block
    }

  });

});
