define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/alert_form"
      , "jquery.tinymce"], function ($, _, Backbone, sg) {

  var views = sg.views;


  views.BlockAttributes = views.AlertForm.extend({

    template: _.template($("#block-attributes-template").html()),


    initialize: function() {
      this.attrs = this.options.attrs || {};
    },

    serializeObject: function() {
      return _.extend(
        {
          is_published: this.$("[name=is_published]").is(":checked") ? true : ""
        },
        this.attrs,
        sg.utils.serializeObject(this.$el)
      );
    },

    render: function() {
      this.$el.html(this.template({
        block: this.model.toJSON(),
        buttonText: t_("Save")
      }));
      return this;
    }

  });


});
