define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "utils"
      , "views/form"], function ($, _, Backbone, sg) {

  var utils = sg.utils
    , views = sg.views || (sg.views = {});


  Alert = Backbone.View.extend({

    template: _.template($("#alert-template").html()),

    render: function(errors) {
      this.$el.html(this.template({errors: errors}));
    }

  });


  views.AlertForm = views.Form.extend({

    showErrors: function(errors) {
      _.each(this.$("[name]"), function(field) {
        $(field).toggleClass(
          "error",
          _.has(errors, field.name)
        );
      }, this);

      this.alert = new Alert({el: this.$(".js-alert")})
        .render(errors);

      return this;
    },

    hideErrors: function() {
      _.each(this.$("[name]"), function(field) {
        $(field).removeClass("error")
      }, this);

      this.alert && this.alert.remove();

      return this;
    }


  });

});
