define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "jquery.tinymce"
      , "views/alert_form"
      ], function ($, _, Backbone, sg, tinymce) {

  var views = sg.views;


  views.DocumentAttributes = views.AlertForm.extend({

    template: _.template($("#document-attributes-template").html()),

    serializeObject: function() {
      return _.extend(
        {
          is_published: this.$("[name=is_published]").is(":checked") ? true : ""
        },
        sg.utils.serializeObject(this.$el)
      );
    },

    render: function() {
      this.$el.html(this.template({
        document: this.model.toJSON(),
        buttonText: t_("Save")
      }));
      return this;
    }

  });



});
