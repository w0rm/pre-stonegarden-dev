define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "utils"
      , "models/model"], function ($, _, Backbone, sg) {

  var models = sg.models;


  models.Document =  models.Model.extend({

    urlRoot: "/a/documents",


    isSystem: function() {
      return !!this.get("is_system");
    },

    getDeleteOptions: function() {
      return {
        title: t_("Delete this file or folder?"),
        message: t_("It will also delete all the nested files.")
      }
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

      if (!this.isSystem()) {
        // System and container blocks cannot be deleted
        items.push({
          text: t_("Delete"),
          click: this.delete
        });
      };

      if(this.get("type") === "document") {
        items.push({
          text: t_("Download"),
          href: this.get("src")
        });
      }

      return {
        items: items,
        context: this
      };

    },

    highlight: function() {
      this.trigger("document:highlight");
    },

    lowlight: function() {
      this.trigger("document:lowlight");
    },

    select: function() {
      this.isSelected = true;
      this.trigger("document:select", this);
    },

    unselect: function() {
      this.isSelected = false;
      this.trigger("document:unselect", this);
    },

    toggleSelected: function() {
      this.isSelected ? this.unselect() : this.select();
    },

    delete: function() {
      this.trigger("document:delete");
    },

    editAttributes: function() {
      this.trigger("document:attributes");
    }


  });

});
