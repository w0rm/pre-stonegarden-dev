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
      return true
    },

    getContextMenu: function() {
      var items = []
        , parentMenu

      items.push({
        text: t_("Attributes"),
        click: this.editAttributes
      })

      if (!this.isSystem()) {
        items.push({
          text: t_("Delete"),
          click: this.deleteDocument
        })
      }

      if(this.get("type") === "document") {
        items.push({
          text: t_("Download"),
          href: this.get("src")
        })
        items.push({
          text: t_("Copy link"),
          click: this.copyLink
        })
      }

      if(this.get("type") === "image") {
        items.push({
          text: t_("Download"),
          click: this.openImage
        })
      }

      return {
        items: items,
        context: this
      }

    },

    openImage: function() {
      window.open(this.get("sizes").l, "_blank")
    },

    deleteDocument: function() {
      this.trigger("document:delete");
    },

    editAttributes: function() {
      this.trigger("document:attributes");
    },

    copyLink: function() {
      this.trigger("document:copyLink");
    }


  });

});
