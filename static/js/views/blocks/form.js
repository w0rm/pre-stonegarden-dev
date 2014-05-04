define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      // , "jquery.tinymce"
      , "medium-editor"
      , "views/form"
      , "plugins/jquery.ace"], function ($, _, Backbone, sg, tinymce) {

  var views = sg.views;

  views.BlockForm = views.Form.extend({

    template: _.template($("#block-form-template-contenteditable").html()),

    initialize: function(options) {
      this.options = options || {};
      this.attrs = this.options.attrs || {};
    },

    serializeObject: function() {
      var htmlcode = this.$("[role=content-editor]").html();
      this.$("[name=content]").val(htmlcode);
      return _.extend(
        this.attrs,
         sg.utils.serializeObject(this.$el)
        // {content: htmlcode}
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
      this.$textarea = this.$("[role=content-editor]");

      if (this.getBlockType() === "wysiwyg") {
        
        //this.$textarea.tinymce(sg.config.tinymce);
        
        // cf = _.extend(sg.config.tinymce, {selector:this.$("[name=content]")})
        // console.log('cf', cf)
        // tinymce.init(cf)
        this.editor = new MediumEditor(this.$textarea, {
              forcePlainText: false,
              buttons:  ['header1', 'header2', 'quote', 'bold', 'italic', 'strikethrough','anchor', 'unorderedlist' ],
              anchorInputPlaceholder: 'Напишите что-нибудь важное',
              firstHeader: 'h2',
              secondHeader: 'h4',
              delay: 500,
              targetBlank: true
          });
      } else {
        this.$textarea.ace();
      }
      return this;
    }

  });



});
