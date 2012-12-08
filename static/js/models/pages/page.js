define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "utils"
      , "models/model"
      , "models/blocks/blocks"], function ($, _, Backbone, sg) {

  var models = sg.models
    , utils = sg.utils;


  models.Page =  models.Model.extend({

    urlRoot: "/a/pages",

    highlight: function(){},

    lowlight: function(){},

    edit: function() {
      this.trigger("page:edit");
    },

    delete: function() {
      this.trigger("page:delete");
    },

    create: function() {
      this.trigger("page:create");
    },

    editCode: function() {
      this.trigger("page:code");
    },

    getParentPath: function() {
       return utils.getParentPath(this.get("path"));
    },

    getIndentedName: function() {
      return new Array(this.get("level") + 1).join("    ") + this.get("name");
    },

    getIds: function() {
      // Returns array of parents (breadcrumbs) ids
      var ids = (this.get("ids") || "").split(",");
      ids = _.reject(ids, function(id){ return !id });
      return _.map(ids, function(id) {
        return parseInt(id, 10) // Ensure decimal conversion
      });
    },

    hasContextMenu: function() {
      return true
    },

    isEdit: function() {
      // TODO: check for pathname
      return window.location.search.indexOf("edit") >= 0
    },

    isSystem: function() {
      return !!this.get("is_system");
    },

    getEditMenu: function() {

      if (this.isEdit()) {
        return {
          text: "",
          className: "sg-ico-cursor",
          href: window.location.pathname,
          title: t_("Exit edit mode")
        }
      } else {
        return {
          text: "",
          className: "sg-ico-cursor",
          href: window.location.pathname + "?edit",
          title: t_("Enter edit mode")
        }
      }

    },

    getPageMenu: function() {

      var items = [];

      items.push({
        text: t_("Page attributes"),
        click: this.edit
      });

      items.push({
        text: t_("Style and scripts"),
        click: this.editCode
      });

      items.push({
        is_separator: true
      });

      items.push({
        text: t_("Create page"),
        click: this.create
      });

      if (!this.isSystem()) {
        items.push({
          text: t_("Delete this page"),
          click: this.delete
        });
      };

      return {
        className: "sg-ico-page",
        items: items,
        text: "",
        title: t_("Page"),
        context: this
      }

    },

    getGlobalMenu: function() {
      return {
        text: "",
        className: "sg-ico-menu-list",
        items: [
          {
            text: t_("Site map"),
            href: "/a/sitemap",
          },
          {
            text: t_("Storage"),
            href: "/a/storage"
          },
          {
            text: t_("Users"),
            href: "/a/users"
          },
          {
            is_separator: true
          },
          {
            text: t_("Exit"),
            className: "sg-ico-exit",
            href: "/logout"
          }
        ]
      };

    },

    getContextMenu: function() {
      return {
        items: [
          this.getEditMenu(),
          this.getPageMenu(),
          this.getGlobalMenu()
        ]
      };
    }


  });

  return models.Page;

});
