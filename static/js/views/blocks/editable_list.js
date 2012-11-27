define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/blocks/list"
      , "views/blocks/inserter"
      , "views/blocks/placeholder"
      , "views/blocks/form"
      , "views/blocks/nav_form"
      , "views/blocks/row_form"], function ($, _, Backbone, sg) {

  var views = sg.views
    , utils = sg.utils;


  views.EditableBlockList = views.BlockList.extend({

    events: {
      "mousemove .js-block": "showInserter",
      "mousemove .js-placeholder": "showInserter",
      "mouseleave": "hideInserter"
    },

    initialize: function() {
      this.inserter = (new views.BlockInserter)
        .on("block:create", this.createBlock, this);
      this.placeholder = (new views.BlockPlaceholder)
        .on("block:create", this.createBlock, this);
      this.collection
        .on("remove", this.showPlaceholder, this)
        .on("add", this.addBlock, this);
    },

    addBlock: function(model, collection, options) {
      // Detach inserter and placeholder
      // to ensure new block is inserted
      // in correct position
      this.hideInserter();
      this.hidePlaceholder();
      return views.BlockList.prototype.addBlock.apply(this, arguments);
    },

    render: function(){
      this.showPlaceholder();
      return views.BlockList.prototype.render.call(this);
    },

    showPlaceholder: function() {
      if (this.collection.length === 0 &&
          !this.placeholder.$el.parent().is(this.el)) {
        this.$el.append(this.placeholder.render().el);
      }
    },

    hidePlaceholder: function() {
      this.placeholder.$el.detach();
      return this;
    },

    showInserter: function(e) {
      var $block = $(e.currentTarget)
        , top = $block.is(".js-placeholder") || (e.pageY - $block.offset().top) < $block.height() / 2
        , $el = $block[top ? "prev" : "next"]();

      if (this._isCreatingBlock) {
        return;
      }

      e.stopPropagation();

      if (!$el.is(".js-inserter") && $block.parent().is(".js-blocks") &&
          !$block.parent().parent().is(".row")) {
        this.inserter.render().$el["insert" + (top ? "Before" : "After") ]($block);
      }

      // Trigger inserter event so parent blocks views
      // will remove their inserters
      this.trigger("inserter:show");

    },

    hideInserter: function() {
      this.inserter.$el.detach();
      return this;
    },

    propagateInserter: function() {
      this.hideInserter();
      this.trigger("inserter:show");
    },

    createBlock: function(attrs) {
      var blockForm;

      if (this._isCreatingBlock) {
        return;
      } else {
        this._isCreatingBlock = true;
      }

      _.extend(attrs, {
        parent_id: this.collection.parentBlock.get("id"),
        page_id: sgData.pageId
      });

      blockForm = new views[utils.guessBlockType(attrs) + "BlockForm"]({
        attrs: attrs,
        collection: this.collection
      })
        .on("reset success", function(block) {
          blockForm.remove();
          this._isCreatingBlock = false;
          this.showPlaceholder();
        }, this);

      // These should be hidden to enforce correct position
      this.hideInserter();

      if (attrs.template === "content") {
        // Hide placeholder only for inline editing
        this.hidePlaceholder();
      }

      if (attrs.position === 1) {
        // Prepend on top of the blocks
        this.$el.prepend(blockForm.el);
      } else {
        // Insert after block
        this.$el.children().eq(attrs.position - 2).after(blockForm.el);
      };

      // This is important, tinymce should be init only
      // when parent div is attached to dom
      blockForm.render();

    }

  });



});
