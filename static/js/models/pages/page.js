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
      this.trigger("page:create", {
        parent_id: this.get("id"),
        type: "page"
      });
    },

    editCode: function() {
      this.trigger("page:code");
    },

    getParentPath: function() {
       return utils.getParentPath(this.get("path"));
    },

    getIndentedName: function(minLevel) {
      var level = this.get("level") - (minLevel || 0)
      return new Array(level + 1).join("    ") + this.get("name");
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
          className: "sg-active sg-ico-cursor",
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
        isSeparator: true
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
            text: t_("Export catalog"),
            href: "/a/catalog/export",
          },
          {
            text: t_("Users"),
            href: "/a/users"
          },
          {
            isSeparator: true
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
    },

    getDeleteOptions: function() {
      return {
        title: t_("Delete this page?"),
        message: t_("Are you sure to delete this page and its subpages?")
      }
    }

  });


  models.CatalogPage = models.Page.extend({

    getCatalogMenuItems: function() {
      return [
        {
          text: t_("Style and scripts"),
          click: this.editCode
        },
        {
          isSeparator: true
        },
        {
          text: t_("Create category"),
          click: this.createCategory
        },
        {
          text: t_("Create product"),
          click: this.createProduct
        }
      ]
    },

    getPageMenu: function() {

      var items = this.getCatalogMenuItems();

      items.unshift({
        text: t_("Catalog attributes"),
        click: this.edit
      });

      return {
        className: "sg-ico-electronics",
        items: items,
        text: "",
        title: t_("Catalog"),
        context: this
      }

    },

    createCategory: function() {
      this.trigger("page:create", {
        parent_id: this.get("id"),
        type: "category"
      });
    },

    createProduct: function() {
      this.trigger("page:create", {
        parent_id: this.get("id"),
        type: "product"
      });
    }

  });


  models.CategoryPage = models.CatalogPage.extend({

    getPageMenu: function() {

      var items = this.getCatalogMenuItems();

      items.unshift({
        text: t_("Category attributes"),
        click: this.edit
      });

      items.push({
        text: t_("Delete this category"),
        click: this.delete
      });

      return {
        className: "sg-ico-electronics",
        items: items,
        text: "",
        title: t_("Category"),
        context: this
      };

    },

    getDeleteOptions: function() {
      return {
        title: t_("Delete this category?"),
        message: t_("Are you sure to delete this category and its contents?")
      }
    }

  });


  models.ProductPage = models.CatalogPage.extend({

    getPageMenu: function() {

      var items = this.getCatalogMenuItems();

      items.unshift({
        text: t_("Product attributes"),
        click: this.edit
      });

      items.push({
        text: t_("Delete this product"),
        click: this.delete
      });


      return {
        className: "sg-ico-electronics",
        items: items,
        text: "",
        title: t_("Product"),
        context: this
      };

    },

    getDeleteOptions: function() {
      return {
        title: t_("Delete this product?"),
        message: t_("Are you sure to delete this product?")
      }
    },

    // Use parent_id

    createProduct: function() {
      this.trigger("page:create", {
        parent_id: this.get("parent_id"),
        type: "product"
      });
    },

    createCategory: function() {
      this.trigger("page:create", {
        parent_id: this.get("parent_id"),
        type: "category"
      });
    }

  });


  models.NewsIndexPage = models.Page.extend({

    getNewsMenuItems: function() {
      return [
        {
          text: t_("Style and scripts"),
          click: this.editCode
        },
        {
          isSeparator: true
        },
        {
          text: t_("Create news"),
          click: this.createNews
        }
      ]
    },

    getPageMenu: function() {

      var items = this.getNewsMenuItems();

      items.unshift({
        text: t_("News index attributes"),
        click: this.edit
      });

      return {
        className: "sg-ico-news",
        items: items,
        text: "",
        title: t_("News Index"),
        context: this
      }

    },

    createNews: function() {
      this.trigger("page:create", {
        parent_id: this.get("id"),
        type: "news"
      });
    }

  });


  models.NewsPage = models.NewsIndexPage.extend({

    getPageMenu: function() {

      var items = this.getNewsMenuItems();

      items.unshift({
        text: t_("News attributes"),
        click: this.edit
      });

      items.push({
        text: t_("Delete news"),
        click: this.delete
      });

      return {
        className: "sg-ico-news",
        items: items,
        text: "",
        title: t_("News"),
        context: this
      };

    },

    getDeleteOptions: function() {
      return {
        title: t_("Delete news?"),
        message: t_("Are you sure to delete news?")
      }
    },

    // Use parent_id

    createNews: function() {
      this.trigger("page:create", {
        parent_id: this.get("parent_id"),
        type: "news"
      });
    }

  });


  models.NewsArchivePage = models.NewsIndexPage.extend({

    getPageMenu: function() {

      var items = this.getNewsMenuItems();

      return {
        className: "sg-ico-news",
        items: items,
        text: "",
        title: t_("News"),
        context: this
      };

    },

    // Use parent_id

    createNews: function() {
      this.trigger("page:create", {
        parent_id: this.get("parent_id"),
        type: "news"
      });
    }

  });

  return models.Page;

});
