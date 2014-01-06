define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/blocks/list"
      , "views/blocks/inserter"
      , "views/blocks/placeholder"
      , "views/blocks/form"
      , "views/blocks/nav_form"
      , "views/blocks/row_form"
      , "views/blocks/image_form"
      , "views/blocks/gallery_form"], function ($, _, Backbone, sg) {

  var views = sg.views
    , utils = sg.utils;


  views.EditableBlockList = views.BlockList.extend({

    events: {
      "mousemove .js-block": "showInserter",
      "mousemove .js-placeholder": "showInserter",
      "mouseleave": "hideInserter"
    },

    initialize: function(options) {
      this.options = options || {};

      this.inserter = new views.BlockInserter()
        .on("block:create", this.createBlock, this)
        .on("block:paste", this.pasteBlock, this)
        .render();

      this.placeholder = (new views.BlockPlaceholder)
        .on("block:create", this.createBlock, this);

      this.collection
        .on("remove", this.showPlaceholder, this)
        .on("add", this.addBlock, this);

      this._isCreatingBlock = false;
    },

    addBlock: function(model, collection, options) {
      // Detach inserter and placeholder
      // to ensure new block is inserted
      // in correct position

      this.removeInserter();
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

      var inserter = this.inserter;
      // pass if inserter-menu is displayed
      if (inserter._isInserting) return;
      if (this._isCreatingBlock) return;

      var $block = $(e.currentTarget);
      var proximity = inserter.proximity || 50
        , proxy = ($block.height() / 2) > proximity ? proximity : $block.height() / 2
        , istop = $block.is(".js-placeholder") || ((e.pageY - $block.offset().top) < proxy)
        , isbottom = $block.is(".js-placeholder") || (e.pageY > ($block.offset().top + $block.height() - proxy))
        , $el = $block[istop ? "prev" : "next"]();

      e.stopPropagation();

      // do nothing while hovering hot area if alredy rendered
      if ( $el.is(".js-inserter") ) return;

      // display inserter only %proximity% pixels from top and bottom edge of te block
      // detach inserter while we move mouse in the center of the block
      if(!istop && !isbottom) {
        inserter.trigger("inserter:detach");
        return;
      }

      if (
        (istop || isbottom)
        && $block.parent().is(".js-blocks")
        && !$block.parent().parent().is(".row")
      ){
        sg.vent.trigger("inserter:detachOthers", inserter);
        inserter.$el["insert" + (istop ? "Before" : "After")]($block);
      }

    },
    hideInserter: function() {
      // to hide inserter we detach it
       if (this.inserter._isInserting) return;
       this.inserter.trigger("inserter:detach");
    },
    // remove  will detach inserter and reset View varibles to default
    removeInserter: function(){
      this.inserter.trigger("inserter:detach");
      sg.vent.trigger("inserter:uninsert");
    },


    pasteBlock: function(attrs) {

      var self = this;

      if (this._isCreatingBlock) {
        return;
      } else {
        this._isCreatingBlock = true;
      }

      _.extend(attrs, {
        parent_id: this.collection.parentBlock.get("id"),
        page_id: sg.page.get("id")
      });

      this.removeInserter();

      this.collection.create(attrs, {
        at: attrs.position - 1,
        wait: true,
        success: function() {
          self._isCreatingBlock = false;
          self.showPlaceholder();
        }
      });

    },

    createBlock: function(attrs) {
      var blockForm;

      if (this._isCreatingBlock) {
        return;
      } else {
        this._isCreatingBlock = true;
      }
      // These should be hidden to enforce correct position
      this.removeInserter();

      _.extend(attrs, {
        parent_id: this.collection.parentBlock.get("id"),
        page_id: sg.page.get("id")
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
