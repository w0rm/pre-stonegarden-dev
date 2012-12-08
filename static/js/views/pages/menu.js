define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/contextmenu"], function ($, _, Backbone, sg) {

  var utils = sg.utils
    , views = sg.views;


  views.PageMenu = Backbone.View.extend({

    tagName: "nav",

    className: "sg-pagemenu",

    template: _.template($("#page-menu-template").html()),

    events: {
      "click .js-create": "createPage",
      "click .js-edit": "editPage",
      "click .js-delete": "deletePage",
      "click .js-code": "editPageCode"
    },

    getTemplateAttributes: function() {
      return {
        isEdit: window.location.search.indexOf("edit") >= 0
      }
    },

    render: function() {
      this.$el.html(this.template(this.getTemplateAttributes()));
      return this
    },

    createPage: function(e) {
      e.preventDefault();
      this.model.create();
    },

    editPage: function(e) {
      e.preventDefault();
      this.model.edit();
    },

    editPageCode: function(e) {
      e.preventDefault();
      this.model.editCode();
    },

    deletePage: function(e) {
      e.preventDefault();
      this.model.delete();
    }




  });


  return views.PageMenu;


});
