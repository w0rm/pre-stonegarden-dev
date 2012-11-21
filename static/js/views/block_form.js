define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "models/block"
      , "views/form"], function ($, _, Backbone, sg) {

  var views = sg.views;


  views.BlockForm = views.Form.extend({

    template: _.template($("#block-form-template").html()),

    initialize: function() {
      this.attrs = this.options.attrs;
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

    render: function() {
      this.$el.html(this.template(this.getTemplateAttributes()));
      return this;
    }

  });



});
