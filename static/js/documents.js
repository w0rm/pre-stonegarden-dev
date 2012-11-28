define(['jquery'
      , 'underscore'
      , 'stonegarden'
      , 'views/documents/storage'
      , 'models/documents/document'
      , 'models/documents/documents'], function ($, _, sg) {


  $(function() {

    var views = sg.views
      , models = sg.models
      , collections = sg.collections
      , storageView;

    if (window.sgData && window.sgData.rootFolder) {

      // Init main view
      storageView = new views.DocumentStorage({
        collection: new collections.Documents,
        model: new models.Document(window.sgData.rootFolder)
      });

      storageView
        .render()
        .$el.appendTo("body");

    }

  });
});
