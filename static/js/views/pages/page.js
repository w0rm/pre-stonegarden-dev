define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "utils"
      , "views/delete_modal"
      , "views/pages/menu"
      , "views/pages/form"
      , "views/pages/code_form"
      , "views/pages/sort_subpages"], function ($, _, Backbone, sg) {

  var utils = sg.utils
    , views = sg.views;


  views.Page = Backbone.View.extend({

    initialize: function() {

      this.menu = new views.PageMenu({model: this.model});

      this.model
        .on("page:create", this.createPage, this)
        .on("page:edit", this.editPage, this)
        .on("page:code", this.editPageCode, this)
        .on("page:delete", this.deletePage, this)
        .on("page:sortSubpages", this.sortSubpages, this)
        .on("change:path", this.redirect, this)
        .on("change:title", this.updateTitle, this)
        .on("destroy", this.redirectToParent, this);

      this.collection
        .on("add", this.hardRedirect, this); // redirect to created page

    },

    render: function() {
      this.$el.prepend(this.menu.render().el);
      return this;
    },

    editPage: function() {
      new views.Modal({
        contentView: new views[utils.guessPageType(this.model.attributes) +
                               "PageForm"]({
          model: this.model,
          pages: this.collection,
          attrs: {
            parent_id: this.model.get("parent_id")
          }
        })
      }).open();
    },

    createPage: function(attrs) {
      new views.Modal({
        contentView: new views[utils.guessPageType(attrs) +
                               "PageForm"]({
          collection: this.collection,
          pages: this.collection,
          attrs: attrs
        })
      }).open();
    },

    deletePage: function() {
      new views.DeleteModal({model: this.model}).open();
    },

    sortSubpages: function() {
      var self = this
      new views.Modal({
        contentView: new views.SortSubpages({
          collection: sg.subPages
        })
        .on("reset", function(){
          self.redirect(self.model)
        })
      }).open();
    },

    editPageCode: function() {
      new views.Modal({
        contentView: new views.PageCodeForm({model: this.model}),
        sizeClass: "xlarge"
      }).open();
    },

    updateTitle: function(model) {
      window.document.title = model.get("title")
    },

    redirect: function(model) {
      if (model.isEdit()) {
        window.history.replaceState({}, "", model.get("path") + window.location.search);
      } else {
        this.hardRedirect(model, false)
      }
    },

    hardRedirect: function(model, withEdit) {
      // withEdit is true when not specified explicitly
      var withEdit = arguments.length == 1 || withEdit;
      window.location.replace(model.get("path") + (withEdit ? "?edit" : ""))
    },

    redirectToParent: function(model) {
      window.location.replace(model.getParentPath() + window.location.search);
    }

  });

  return views.Page;

});
