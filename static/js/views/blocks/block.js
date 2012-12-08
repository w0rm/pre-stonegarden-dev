define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/mixins/has_contextmenu"
      , "views/modal"
      , "views/blocks/list"
      , "views/blocks/editable_list"
      , "views/blocks/attributes"
      , "views/blocks/delete"], function ($, _, Backbone, sg) {

  var utils = sg.utils
    , views = sg.views
    , mixins = sg.mixins;


  // TODO: Baseblock view, that has makeBlockView, propagateContextMenu
  // then views.Block and views.Blocks subclass it.

  views.Block = Backbone.View.extend(_.extend({}, mixins.hasContextMenu, {
    initialize: function() {
      this.model
        .on("block:highlight", this.highlightBlock, this)
        .on("block:lowlight", this.lowlightBlock, this)
        .on("block:delete", this.deleteBlock, this)
        .on("block:edit", this.editBlock, this)
        .on("block:attributes", this.editAttributes, this)
        .on("destroy", this.remove, this)
        .on("change", this.updateBlock, this);
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

    editAttributes: function() {
      new views.Modal({
        contentView: new views.BlockAttributes({
          model: this.model,
          attrs: {
            page_id: sg.page.get("id")
          }
        })
      }).open();
    },

    editBlock: function() {
      var blockForm = new views[utils.guessBlockType(this.model.attributes) +
                                "BlockForm"]({
        model: this.model,
        attrs: {
          page_id: sg.page.get("id")
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
        .on("contextmenu:show", this.propagateContextMenu, this)
        .on("inserter:show", this.propagateInserter, this)
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
        blocksViewClassName = (this.model.isContainer() ? "Editable" : "") + "BlockList";
        this.blocks = new views[blocksViewClassName]({
          el: $blocks,
          collection: this.model.blocks
        })
          .on("contextmenu:show", this.propagateContextMenu, this)
          .on("inserter:show", this.propagateInserter, this)
          .render();
      };

      return this;
    },

    propagateContextMenu: function() {
      this.hideContextMenu();
      this.trigger("contextmenu:show");
    },

    propagateInserter: function() {
      this.trigger("inserter:show");
    }

  }));

});
