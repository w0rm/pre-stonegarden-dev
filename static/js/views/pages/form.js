define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/alert_form"], function ($, _, Backbone, sg) {

  var views = sg.views;


  views.PageForm = views.AlertForm.extend({

    template: _.template($("#page-form-template").html()),

    initialize: function(options) {
      this.options = options || {};
      this.attrs = this.options.attrs || {};
      this.pages = this.options.pages;
    },

    serializeObject: function() {
      return _.extend(
        {
          is_published: this.$("[name=is_published]").is(":checked") ? true : "",
          is_navigatable: this.$("[name=is_navigatable]").is(":checked") ? true : ""
        },
        this.attrs,
        sg.utils.serializeObject(this.$el)
      );
    },

    pagesFilter: function(p) {
      return true;
    },

    disabledFilter: function(p) {
      var modelId;
      if (this.hasModel()) {
        modelId = this.model.get("id");
        return (p.get("id") === modelId || _.contains(p.getIds(), modelId))
      } else {
        return false
      }
    },

    selectedFilter: function(p) {
      return p.get("id") === this.attrs.parent_id
    },

    getTemplateAttributes: function() {
      var pagesList = this.pages.getIndentedList({
                        filter: this.pagesFilter,
                        disabledFilter: this.disabledFilter,
                        selectedFilter: this.selectedFilter
                      }, this)
        , page = this.hasModel() ? this.model.toJSON() : {};

      return {
        hasModel: this.hasModel(),
        page: page,
        parentId: this.attrs.parent_id,
        pagesList: pagesList
      };
    },

    render: function() {
      this.$el.html(this.template(this.getTemplateAttributes()));
      return this;
    }

  });

   
});
