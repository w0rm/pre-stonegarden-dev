define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "utils"
      , "models/model"
      , "models/blocks/blocks"], function ($, _, Backbone, sg) {

  var collections = sg.collections
    , models = sg.models;


  models.Block =  models.Model.extend({

    urlRoot: "/a/blocks",

    initialize: function() {
      this.blocks = new collections.Blocks;
      this.blocks.parentBlock = this;
      this.on("change:blocks", this.updateBlocks);
      this.updateBlocks();
    },

    updateBlocks: function() {
      this.blocks.reset(this.get("blocks"));
    },

    // State information

    isContainer: function() {
      return _.contains(["page", "column"], this.get("template"));
    },

    hasBlocks: function() {
      return _.contains(["page", "column", "row"], this.get("template"));
    },

    isSystem: function() {
      return !!this.get("is_system");
    },

    hasParent: function() {
      return !!this.parentBlock;
    },

    // Contextmenu items

    hasContextMenu: function() {
      return !this.isSystem();
    },

    getContextMenu: function() {
      var items = []
        , parentMenu;

      items.push({
        text: t_("Edit"),
        click: this.edit
      });


      items.push({
        text: t_("Attributes"),
        click: this.editAttributes
      });

      if (!this.isContainer()) {
        // System and container blocks cannot be deleted
        items.push({
          text: t_("Delete"),
          click: this.delete
        });
      };


      if (this.hasParent()) {
        parentMenu = this.parentBlock.getContextMenu();
        if (parentMenu && !_.isEmpty(parentMenu.items)) {
          items.push(_.extend(
            {text: t_("Parent")},
            parentMenu
          ))
        }
      };

      return {
        items: items,
        context: this
      };

    },

    edit: function() {
      this.trigger("block:edit");
    },

    delete: function() {
      this.trigger("block:delete");
    },

    editAttributes: function() {
      this.trigger("block:attributes");
    },

    highlight: function() {
      this.trigger("block:highlight");
    },

    lowlight: function() {
      this.trigger("block:lowlight");
    }

  });


  models.WysiwygBlock = models.Block;

  models.PageBlock = models.Block.extend({
    hasContextMenu: function() {
      return false;
    },

    getContextMenu: function() {
      return false
    }
  });

  models.RowBlock = models.Block.extend({

    updateBlocks: function() {

      var parentBlocks
        , newSize
        , index
        , orphans;

      parentBlocks = this.hasParent() && this.parentBlock.blocks;

      // Expand orphaned blocks from deleted columns
      if (parentBlocks) {
        // Get new row size
        newSize = this.get("blocks").length;
        // Get index of row block
        index = parentBlocks.indexOf(this);
        orphans = [];
        // collect orphaned blocks
        this.blocks.each(function(column, idx) {
          if (idx >= newSize) {
            orphans = orphans.concat(column.blocks.models);
          }
        }, this);
        // add orphans after row block
        parentBlocks.add(orphans, {at: index + 1});
      }

      // Replace row's columns
      models.Block.prototype.updateBlocks.apply(this, arguments);

    }

  });

  models.NavBlock = models.Block;

  models.ColumnBlock = models.Block.extend({

    hasContextMenu: function() {
      return false;
    },

    getContextMenu: function() {
      if (this.hasParent()) {
        return this.parentBlock.getContextMenu()
      }
    }

  });

});
