define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/form"
      , "jquery.tinymce"
      , "plugins/jquery.ace"], function ($, _, Backbone, sg) {

  var views = sg.views;

  views.BlockForm = views.Form.extend({

    template: _.template($("#block-form-template").html()),

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
        block: this.model.toJSON(),
        buttonText: t_("Save")
      } :
      {
        block: {},
        buttonText: t_("Add")
      }
    },

    getBlockType: function() {
      return this.hasModel() ? this.model.get("type") : this.attrs.type;
    },

    render: function() {
      var self = this;

      this.$el.html(this.template(this.getTemplateAttributes()));
      this.$textarea = this.$("[name=content]");

      if (this.getBlockType() === "wysiwyg") {
        this.$textarea.tinymce(sg.config.tinymce);
      } else {
        this.$textarea.ace()
      }
      return this;
    }

  });



});
