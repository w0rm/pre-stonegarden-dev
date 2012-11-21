define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/modal"
      , "views/blocks"
      , "views/block_inserter"
      , "views/block_placeholder"], function ($, _, Backbone, sg) {


  var views = sg.views || (sg.views = {})
    , utils = sg.utils;


  views.BlocksEditable = views.Blocks.extend({

    events: {
      "mousemove .js-block": "attachInserter",
      "mousemove .js-placeholder": "attachInserter",
      "mouseleave": "detachInserter"
    },

    initialize: function() {
      this.inserter = (new views.BlockInserter)
        .on("block:create", this.createBlock, this);
      this.placeholder = (new views.BlockPlaceholder)
        .on("block:create", this.createBlock, this);
      this.collection
        .on("remove", this.appendPlaceholder, this)
        .on("add", this.detachPlaceholder, this);
    },

    render: function(){
      this.appendPlaceholder();
      return views.Blocks.prototype.render.call(this);
    },

    appendPlaceholder: function() {
      if (this.collection.length === 0 &&
          !this.placeholder.$el.parent().is(this.el)) {
        this.$el.append(this.placeholder.render().el);
      }
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

    detachPlaceholder: function() {
      this.placeholder.$el.detach();
      return this;
    },

    detachInserter: function() {
      this.inserter.$el.detach();
      return this;
    },

    createBlock: function(attrs) {
      this.detachInserter();
      this.detachPlaceholder();
      _.extend(attrs, {
        parent_id: this.collection.parentBlock.get("id")
      });

      console.log(utils.guessBlockType(attrs))

    }

  });



});
