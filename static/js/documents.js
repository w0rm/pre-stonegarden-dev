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
      , storageView
      , DocumentRouter
      , documentRouter;


    var DocumentRouter = Backbone.Router.extend({

      routes: {
        "": "folder",
        ":folder_id": "folder"
      },

      initialize: function() {

        this.rootFolder = new models.Document(window.sgData.rootFolder);

        this.documents = (new collections.Documents)
          .on("document:open", this.navigateToFolder, this);

        this.view = new views.DocumentStorage({
          collection: this.documents
        });

        this.view
          .render()
          .$el.appendTo("body");
      },

      navigateToFolder: function(folder) {
        if (folder.get("type") === "folder") {
          this.navigate("//" + folder.get("id"), {trigger: false});
        }
      },

      folder: function(folder_id) {
        var folder;
        if (folder_id) {
          folder = new models.Document({id: folder_id})
            .on("change", function(model) {
              this.view.open(model)
            }, this)
            .fetch();
        } else {
          this.view.open(this.rootFolder);
        }
      }

    });

    if (window.sgData && window.sgData.rootFolder) {
      // Init main view
      documentRouter = new DocumentRouter;
      Backbone.history.start({pushState: true, root: "/a/storage"})
    }

  });
});
