define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "utils"
      , "models/buffer"
      , "models/model"
      , "models/blocks/blocks"], function ($, _, Backbone, sg) {

  var collections = sg.collections
    , models = sg.models
    , buffer = sg.buffer;


  models.Block =  models.Model.extend({

    urlRoot: "/a/blocks",

    initialize: function() {
      this.blocks = new collections.Blocks
      this.blocks.parentBlock = this
      this.on("change:blocks", this.updateBlocks)
      this.updateBlocks()
      this.initBlock()
    },

    initBlock: function() {},

    updateBlocks: function() {
      this.blocks.reset(this.get("blocks"));
    },

    // State information

    isContainer: function() {
      // block allows other blocks to be inserted/created
      return false;
    },

    hasBlocks: function() {
      // block may contain other blocks
      return false;
    },

    isTemplate: function () {
      return !! this.get("name")
    },

    isSystem: function() {
      return !!this.get("is_system");
    },

    hasParent: function() {
      return !!this.parentBlock;
    },

    getDeleteOptions: function() {
      return {
        title: t_("Delete this block?"),
        message: t_("It will also delete all the nested blocks.")
      }
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

      if (!this.hasBlocks()) {
        items.push({
          isSeparator: true
        });
        items.push({
          text: t_("Cut"),
          click: this.cut
        });
        items.push({
          text: t_("Copy"),
          click: this.copy
        });
        items.push({
          isSeparator: true
        });
      }

      if (!this.isTemplate()) {
        items.push({
          text: t_("Delete"),
          click: this.delete
        });
      }

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
    },

    copy: function() {
      var data = {};
      _.each(this.attributes, function(value, key) {
        if (_.contains(["template", "type", "sizes", "content",
                        "css_class", "is_published"], key)) {
          data[key] = value;
        }
      })
      buffer.save("block", data);
      this.trigger("block:copy");
    },

    cut: function() {
      this.copy();
      this.destroy();
    },

    isEditableOnDoubleClick: function() {
      // todo return false here and create separate class for
      // wysiwyg block
      return !this.isSystem() && this.get("type") === "wysiwyg";
    }

  });


  models.PageBlock = models.Block.extend({
    hasContextMenu: function() {
      return false;
    },

    getContextMenu: function() {
      return false
    },

    hasBlocks: function() {
      return true
    },

    isContainer: function() {
      return true
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

    },

    hasBlocks: function() {
      return true
    }

  });


  models.NavBlock = models.Block.extend({

    initBlock: function() {
      sg.page.on("change:path change:title", function(){
        this.fetch({
          data: {
            page_id: sg.page.get("id")
          }
        })
      }, this)
    }

  });


  models.ImageBlock = models.Block.extend({

    getImageAttributes: function() {
      return $(this.get("content")).data()
    }

  });


  models.GalleryBlock = models.Block.extend({

    getGalleryAttributes: function() {
      return $(this.get("content")).data("options")
    }

  });


  models.ColumnBlock = models.Block.extend({

    hasContextMenu: function() {
      return false;
    },

    getContextMenu: function() {
      if (this.hasParent()) {
        return this.parentBlock.getContextMenu()
      }
    },

    hasBlocks: function() {
      return true
    },

    isContainer: function() {
      return true
    }

  });


  models.PageTitleBlock = models.Block.extend({

    initBlock: function() {
      sg.page.on("change:title", function(){
        this.fetch({
          data: {
            page_id: sg.page.get("id")
          }
        })
      }, this)
    },

    hasContextMenu: function() {
      return true
    },

    getContextMenu: function() {

      if (!this.isSystem()) {
        return models.Block.getContextMenu.call(this)
      }

      var items = []
        , parentMenu;

      items.push({
        text: t_("Edit"),
        click: this.edit
      });

      return {
        items: items,
        context: this
      };

    },

    edit: function() {
      sg.page.trigger("page:edit")
    },

    isEditableOnDoubleClick: function() {
      return true;
    }

  })



});
