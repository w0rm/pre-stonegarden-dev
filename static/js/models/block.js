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
      this.createBlocks(this.get("blocks"));
    },

    set: function(key, value, options) {
      var attrs;

      if (_.isObject(key) || key == null) {
        attrs = key;
        options = value;
      } else {
        attrs = {};
        attrs[key] = value;
      }

      if ("blocks" in attrs) {
        this.createBlocks(attrs.blocks)
      }

      return (Backbone.Model.prototype.set).apply(this, arguments);
    },

    createBlocks: function(blocks) {
      var self = this;
      this.blocks = new collections.Blocks(blocks);
      this.blocks.parentBlock = this;
      this.blocks.each(function(block){
        block.parentBlock = self
      })
    },

    // State information

    isContainer: function() {
      return _.contains(["page", "column"], this.get("template"));
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

  models.RowBlock = models.Block;

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
