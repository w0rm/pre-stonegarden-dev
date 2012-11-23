define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "utils"
      , "models/blocks"
      , "models/model"], function ($, _, Backbone, sg) {


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

    updateBlocks: function(model, blocks) {
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
      return true;
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

      if (!this.isSystem() && !this.isContainer()) {
        // System and container blocks cannot be deleted
        items.push({
          text: t_("Delete"),
          click: this.delete
        });
      };

      if (this.hasParent()) {
        parentMenu = this.parentBlock.getContextMenu();
        if (parentMenu) {
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


  });

  models.NavBlock = models.Block;

  models.ColumnBlock = models.Block.extend({

    hasContextMenu: function() {
      return false;
    },

    getContextMenu: function() {
      return this.parentBlock.getContextMenu()
    }

  });

});
