define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "plugins/jquery.ace"
      , "views/alert_form"], function ($, _, Backbone, sg) {

  var views = sg.views;


  views.PageCodeForm = views.AlertForm.extend({

    template: _.template($("#page-code-form-template").html()),

    initialize: function(options) {
      this.options = options || {};
      this.attrs = this.options.attrs || {};
    },

    serializeObject: function() {
      return _.extend(
        this.attrs,
        sg.utils.serializeObject(this.$el)
      );
    },

    getTemplateAttributes: function() {
      return this.hasModel() ?
      {
        page: this.model.toJSON(),
        buttonText: t_("Save")
      } :
      {
        page: {},
        buttonText: t_("Add")
      }
    },

    render: function() {
      this.$el.html(this.template(this.getTemplateAttributes()));

      this.$("[name=js_code]").ace();
      this.$("[name=css_code]").ace();

      return this;
    }

  });


});
