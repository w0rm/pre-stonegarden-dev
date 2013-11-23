define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "jquery.tinymce"], function ($, _, Backbone, sg, tinymce) {

  var views = sg.views;


  views.DocumentCopyLink = Backbone.View.extend({

    template: _.template($("#document-copy-link-template").html()),

    events: {
      'click input': 'selectLink'
    },

    render: function() {
      this.$el.html(this.template({
        document: this.model.toJSON()
      }));
      return this;
    },

    selectLink: function (e) {
      e.currentTarget.select()
    }

  });

});
