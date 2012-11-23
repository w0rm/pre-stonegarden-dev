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
    , utils = sg.utils
    , views = sg.views;

  // TODO: Baseblock view, that has makeBlockView, propagateContextMenu
  // then views.Block and views.Blocks subclass it.

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
        .on("block:edit", this.editBlock, this)
        .on("destroy", this.remove, this)
        .on("change:html change:blocks", this.updateBlock, this);
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
      }).open();
    },

    editBlock: function() {
      var blockForm = new views[utils.guessBlockType(this.model.attributes) +
                                "BlockForm"]({
        model: this.model,
        attrs: {
          page_id: sgData.pageId
        }
      })
        .on("success reset", function() {
          blockForm.remove();
          this.lowlightBlock();
          this.$el.show();
        }, this);
      this.hideContextMenu();
      this.propagateInserter();
      this.$el.after(blockForm.el)
      if (this.model.get("template") === "content") {
        // Hide block only if editing inline
        this.$el.hide();
      }
      blockForm.render();
    },

    updateBlock: function() {
      var $newEl = $(this.model.get("html"));
      this.hideContextMenu(); // detach context menu
      this.setElement($newEl.replaceAll(this.el)); // replace element
      return this.render(); // render nested blocks
    },

    makeBlockView: function(block) {
      return new views.Block({model: block, el: block.get("html")})
        .on("block:contextmenu", this.propagateContextMenu, this)
        .on("block:inserter", this.propagateInserter, this)
        .render()
    },

    render: function() {
      var self = this
        , blocksViewClassName
        , $blocks = this.$(".js-blocks"); // cache this element
                                          // before nested .js-blocks
                                          // are rendered
      // Render template blocks
      this.$(".js-template-block").each(function() {
        var $block = $(this)
          , block = sg.templateBlocks.findByName($block.data("name"));
        block && $block.append(self.makeBlockView(block).el);
      });

      // Render blocks
      if (this.model.hasBlocks()) {
        blocksViewClassName = "Blocks" + (
          this.model.isContainer() ? "Editable" : "");
        this.blocks = new views[blocksViewClassName]({
          el: $blocks,
          collection: this.model.blocks
        })
          .on("block:contextmenu", this.propagateContextMenu, this)
          .on("block:inserter", this.propagateInserter, this)
          .render();
      };

      return this;
    },

    showContextMenu: function(e) {
      if (this.model.hasContextMenu()) {
        e.stopPropagation()
        this.$el.prepend(this.contextMenu.render().el);
        this.trigger("block:contextmenu");
      }
    },

    hideContextMenu: function() {
      if (this.model.hasContextMenu()) {
        this.contextMenu.$el.detach();
      }
    },

    propagateContextMenu: function() {
      this.hideContextMenu();
      this.trigger("block:contextmenu");
    },

    propagateInserter: function() {
      this.trigger("block:inserter");
    }

  });

});
