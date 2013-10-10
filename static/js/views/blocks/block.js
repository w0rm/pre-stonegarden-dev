define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/mixins/has_contextmenu"
      , "views/modal"
      , "views/delete_modal"
      , "views/blocks/list"
      , "views/blocks/editable_list"
      , "views/blocks/attributes"
      , "plugins/jquery.gallery"], function ($, _, Backbone, sg) {

  var utils = sg.utils
    , views = sg.views
    , mixins = sg.mixins;


  views.Block = Backbone.View.extend(_.extend({}, mixins.hasContextMenu, {

    events: _.extend({

      "dblclick" : "editOnDoubleClick"

    }, mixins.hasContextMenu.events),

    initialize: function() {
      this.model
        .on("change:isHighlighted", this.highlightBlock, this)
        .on("block:delete", this.deleteBlock, this)
        .on("block:edit", this.editBlock, this)
        .on("block:attributes", this.editAttributes, this)
        .on("block:copy", this.hideContextMenu, this)
        .on("destroy", this.remove, this)
        .on("change:html change:is_published",
            this.updateBlock, this);
    },

    highlightBlock: function(block, isHighlighted) {
      this.$el.toggleClass("sg-block-highlight", isHighlighted);
    },

    editOnDoubleClick: function() {
      if (this.model.isEditableOnDoubleClick()) {
        this.model.edit()
      }
    },

    deleteBlock: function() {
      new views.DeleteModal({model: this.model}).open();
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
          this.model.set('isHighlighted', false)
          this.$el.show();
        }, this);
      this.hideContextMenu();
      this.propagateInserter();
      this.$el.after(blockForm.el)
      if (_.contains(["html", "wysiwyg"], this.model.get("type"))) {
        // Hide block only if editing inline
        this.$el.hide();
      }
      blockForm.render();
    },

    updateBlock: function() {
      var $newEl = $(this.model.getHTML());
      this.hideContextMenu(); // detach context menu
      this.setElement($newEl.replaceAll(this.el)); // replace element
      return this.render(); // render nested blocks
    },

    makeBlockView: function(block) {
      return new views.Block({model: block, el: block.getHTML()})
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

      // TODO: review for better implementation
      setTimeout(function(){
        self.$(".js-gallery").gallery();
      }, 0)

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
