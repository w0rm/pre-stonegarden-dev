define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/block_inserter"
      , "views/context_menu"
      , "models/block"], function ($, _, Backbone, sg) {


  var collections = sg.collections
    , models = sg.models
    , views = sg.views || (sg.views = {});


  views.Block = Backbone.View.extend({

    events: {
      "mouseenter": "showContextMenu",
      "mouseleave": "hideContextMenu",
      "mousemove .js-block": "attachInserter",
      "mousemove .js-placeholder": "attachInserter",
      "mouseleave .js-blocks": "detachInserter"
    },

    initialize: function() {
      this.inserter = new views.BlockInserter;
      this.contextMenu = new views.ContextMenu({model: this.model});
      this.model.on("highlight", this.highlight, this);
      this.model.on("lowlight", this.lowlight, this);
    },

    highlight: function() {
      this.$el.addClass("sg-block-highlight");
    },

    lowlight: function() {
      this.$el.removeClass("sg-block-highlight");
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

        new views.Block({model: block, el: block.get("html")})
          .render().$el.appendTo($block);
      });

      if (this.model.blocks.length) {
        // Append blocks
        this.model.blocks.each(this.appendBlock, this);
      } else if (this.model.isContainer()) {
        // Show placeholder
        this.placeholder = new models.WysiwygBlock;
        this.placeholder.parentBlock = this.model;
        this.appendBlock(this.placeholder);
      }

      return this;
    },

    appendBlock: function(block) {
      this.$blocks.append(
        new views.Block({
          model: block,
          el: block.get("html")
        }).render().el
      );
    },

    showContextMenu: function(e) {
      e.stopPropagation()
      this.$el.prepend(this.contextMenu.render().el);
    },

    hideContextMenu: function(e) {
      this.contextMenu.$el.detach()
    },

    attachInserter: function(e) {
      var $block = $(e.currentTarget)
        , top = $block.is(".js-placeholder") || (e.pageY - $block.offset().top) < $block.height() / 2
        , $el = $block[top ? "prev" : "next"]();

      e.stopPropagation();

      if (!$el.is(".js-inserter") && $block.parent().is(".js-blocks") &&
          !$block.parent().parent().is(".row")) {
        this.inserter.render().$el["insert" + (top ? "Before" : "After") ]($block);
      }

    },

    detachInserter: function(e) {
      this.inserter.$el.detach()
    },

    editBlock: function(e) {
      var $block = $(e.currentTarget);
      e.stopPropagation();
      // edit block
    }

  });

});
