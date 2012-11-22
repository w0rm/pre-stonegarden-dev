define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "models/block"
      , "views/form"
      , "jquery.tinymce"], function ($, _, Backbone, sg) {

  var views = sg.views
    , NavBlockForm;


  NavBlockForm = views.Form.extend({

    template: _.template($("#block-nav-form-template").html()),

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
      } :
      {
        block: {},
      }
    },

    render: function() {
      this.$el.html(this.template(this.getTemplateAttributes()));
      return this;
    }

  });


  views.NavBlockForm = Backbone.View.extend({

    initialize: function() {
      this.formView = new NavBlockForm({
        model: this.model,
        collection: this.collection,
        attrs: this.options.attrs
      }).on("all", this.proxyEvent, this)
    },

    proxyEvent: function() {
      this.trigger.apply(this, arguments);
    },

    render: function() {
      new views.Modal({
        contentView: this.formView
      }).open();
      return this;
    }

  });



});
