define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/alert_form"
      , "jquery.tinymce"], function ($, _, Backbone, sg) {

  var views = sg.views;


  views.DocumentForm = views.AlertForm.extend({

    template: _.template($("#document-form-template").html()),

    initialize: function() {
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
        "document": this.model.toJSON(),
        buttonText: t_("Save")
      } :
      {
        "document": {},
        buttonText: t_("Add")
      }
    },

    render: function() {
      this.$el.html(this.template(this.getTemplateAttributes()));
      return this;
    }

  });


});