define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/form"
      , "jquery.tinymce"
      , "ace/ace"], function ($, _, Backbone, sg) {

  var views = sg.views
    , ace = require("ace/ace");

  views.BlockForm = views.Form.extend({

    template: _.template($("#block-form-template").html()),

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
        this.$ace = $("<div class='sg-ace'></div>");
        this.$textarea.hide().after(this.$ace);
        this.editor = ace.edit(
          this.$ace.get(0)
        );
        this.editor.getSession().setValue(this.$textarea.val());
        this.editor.getSession().on('change', function(){
          self.$textarea.val(self.editor.getSession().getValue());
        });
        //this.editor.setTheme("ace/theme/twilight");
        this.editor.setFontSize(10);
        this.editor.getSession().setMode("ace/mode/html");
      }
      return this;
    }

  });



});
