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
        // TODO: make this work instead of form success callback
        //.on("sync", this.reRender, this)
        //.on("change:html", this.reRender, this)
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
      var blockForm;

      blockForm = new views[utils.guessBlockType(this.model.attributes) + "BlockForm"]({
        model: this.model,
        attrs: {
          page_id: sgData.pageId
        }
      })
        .on("success", function() {
          blockForm.remove();
          this.reRender();
        }, this)
        .on("reset", function() {
          blockForm.remove();
          this.$el.show();
        }, this);

      this.hideContextMenu();
      this.lowlightBlock();

      this.$el.after(blockForm.el).hide();

      blockForm.render();
    },

    reRender: function() {
      this.hideContextMenu(); // detach context menu
      this.$el.replaceWith(this.model.get("html")); // replace element
      this.setElement(this.$el); // rebind events
      this.render(); // render nested blocks
    },

    makeBlockView: function(block) {
      return new views.Block({model: block, el: block.get("html")})
        .on("block:contextmenu", this.propagateContextMenu, this)
        .render()
    },

    render: function() {
      var self = this;
        , $blocks = this.$(".js-blocks"); // cache this element
                                          // before nested .js-blocks
                                          // are rendered

      // Append template blocks
      this.$(".js-template-block").each(function() {
        var $block = $(this)
          , block = sg.templateBlocks.findByName($block.data("name"));
        block && $block.append(self.makeBlockView(block).el);
      });

      // Render blocks
      // TODO: simplify code
      if (this.model.isContainer()) {
        this.blocks = new views.BlocksEditable({
          el: $blocks,
          collection: this.model.blocks
        })
          .on("block:contextmenu", this.propagateContextMenu, this)
          .render()
      } else if (this.model.blocks.length) {
        this.blocks = new views.Blocks({
          el: $blocks,
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
    }

  });

});
