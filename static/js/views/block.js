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
      "mouseenter .js-block": "showContextMenu",
      "mousemove .js-block": "attachInserter",
      "mousemove .js-placeholder": "attachInserter",
      "mouseleave .js-blocks": "detachInserter"
    },

    initialize: function() {
      this.inserter = new views.BlockInserter;
      this.contextMenu = new views.ContextMenu({model: this.model});
    },

    render: function() {
      var self = this;

      this.$blocks = this.$(".js-blocks");

      this.$(".js-template-block").each(function() {
        var $block = $(this)
          , block_name = $block.data("name")
          , block = sg.templateBlocks.find(function(b) {
              return b.get("name") === block_name
            });

        new views.Block({model: block, el: block.get("html")})
          .render().$el.appendTo($block);
      });

      this.model.blocks.each(function(block) {
        this.$blocks.append(
          new views.Block({
            model: block,
            el: block.get("html")
          }).render().el
        );
      }, this);

      return this;
    },

    showContextMenu: function(e) {
      e.stopPropagation()
      this.$el.prepend(this.contextMenu.render().el);
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
