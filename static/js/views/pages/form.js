define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/alert_form"], function ($, _, Backbone, sg) {

  var views = sg.views;


  views.PageForm = views.AlertForm.extend({

    template: _.template($("#page-form-template").html()),

    initialize: function() {
      this.attrs = this.options.attrs || {};
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

    getTemplateAttributes: function() {
      return this.hasModel() ?
      {
        page: this.model.toJSON()
      } :
      {
        page: {}
      }
    },

    render: function() {
      this.$el.html(this.template(this.getTemplateAttributes()));
      return this;
    }

  });


});
