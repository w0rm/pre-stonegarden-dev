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

    if (window.sgData && window.sgData.documentId) {

      // init template blocks collection
      sg.documents = new collections.Documents;

      // init main view
      storageView = new views.DocumentStorage({
        collection: sg.documents
      });

      storageView
        .render()
        .$el.appendTo("body");

      storageView
        .navigateTo(window.sgData.documentId);

    }

  });
});
