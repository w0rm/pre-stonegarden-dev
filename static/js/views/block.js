define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "./block_inserter"
      , "./context_menu"], function ($, _, Backbone, sg) {

  var collections = sg.collections
    , models = sg.models
    , views = sg.views || (sg.views = {});


  views.Block = Backbone.View.extend({

    events: {
      "mouseenter .js-block": "showContextMenu",
      "mousemove .js-block": "attachInserter",
      "mousemove .js-placeholder": "attachInserter"
    },

    initialize: function() {
      this.inserter = new views.BlockInserter;
    },

    showContextMenu: function(e) {
      e.stopPropagation()
      // TODO: get block model and show context menu
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

    editBlock: function(e) {
      var $block = $(e.currentTarget);
      e.stopPropagation();
      // edit block
    }

  });

});
