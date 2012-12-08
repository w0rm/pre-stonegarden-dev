define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/delete_modal"
      , "views/pages/menu"
      , "views/pages/form"
      , "views/pages/code_form"], function ($, _, Backbone, sg) {

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
        .on("change:path", this.redirect, this)
        .on("destroy", this.redirectToParent, this);

      this.collection
        .on("add", this.redirect, this); // redirect to created page

    },

    render: function() {
      this.$el.prepend(this.menu.render().el);
      return this;
    },

    editPage: function() {
      new views.Modal({
        contentView: new views.PageForm({
          model: this.model,
          pages: this.collection,
          attrs: {
            parent_id: this.model.get("parent_id")
          }
        })
      }).open();
    },

    createPage: function() {
      new views.Modal({
        contentView: new views.PageForm({
          collection: this.collection,
          pages: this.collection,
          attrs: {
            parent_id: this.model.get("id")
          }
        })
      }).open();
    },

    deletePage: function() {
      new views.DeleteModal({model: this.model}).open();
    },

    editPageCode: function() {
      new views.Modal({
        contentView: new views.PageCodeForm({model: this.model})
      }).open();
    },

    redirect: function(model) {
      window.location.replace(model.get("path"));
    },

    redirectToParent: function(model) {
      window.location.replace(model.getParentPath());
    }

  });

  return views.Page;

});
