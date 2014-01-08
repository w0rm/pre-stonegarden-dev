define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "jquery.tinymce"
      , "views/alert_form"
      ], function ($, _, Backbone, sg, tinymce) {

  var views = sg.views;


  views.DocumentPreview = views.AlertForm.extend({

    template: _.template($("#document-preview-template").html()),
    
    initialize: function(options) {
      this.options = options || {};
    },

    render: function() {
      // console.log('from render Preview', this.options.list, this.options.list.toJSON());
      var id = this.model.get('id')
      this.$el.html(this.template({
        documents: this.model.collection.toJSON(),
        id : id
      }));

      var gall = this.$el.find('.previewGallery')
      var $gall = gall.fotorama({
          captions:true,
          width: '100%',
          startindex: 'frame'+id,
          nav: "thumbs",
          keyboard: true,
          shadows: true, 
          allowfullscreen: true
        })
      return this;
    },



  });



});
