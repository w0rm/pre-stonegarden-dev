define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "utils"
      , "models/blocks"], function ($, _, Backbone, sg) {


  var collections = sg.collections || (sg.collections = {})
    , models = sg.models || (sg.models = {});


  models.Block = Backbone.Model.extend({

    urlRoot: "/a/blocks",

    initialize: function() {
      this.blocks = new collections.Blocks;
      this.blocks.reset(this.get("blocks"));
      this.blocks.each(function(block){
        block.parentBlock = this;
      }, this)
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
      var items = [];

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
        items.push(_.extend(
          {text: t_("Parent")},
          this.parentBlock.getContextMenu()
        ))
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


  models.WysiwygBlock = models.Block.extend({

    defaults: {
      type: "wysiwyg",
      template: "content",
      html: $("#block-placeholder-template").html()
    },

    hasContextMenu: function() {
      return !this.isNew();
    }

  });

  models.PageBlock = models.Block.extend({
    hasContextMenu: function() {
      return false;
    },
  });

  models.RowBlock = models.Block;

  models.ColumnBlock = models.Block.extend({

    hasContextMenu: function() {
      return false;
    },

    getContextMenu: function() {
      return this.parentBlock.getContextMenu()
    }

  });

});
