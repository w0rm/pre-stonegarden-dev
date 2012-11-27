define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "utils"
      , "models/documents/document"], function ($, _, Backbone, sg) {

  var collections = sg.collections || (sg.collections = {})
    , models = sg.models
    , utils = sg.utils;

  collections.Documents = Backbone.Collection.extend({

    model: models.Document,

    url: "/a/documents",

    getUploadPosition: function() {
      var firstNonFolder = this.find(function(d) {
            return d.get("type") != "folder";
          })
        , position = firstNonFolder ?
            firstNonFolder.get("position") :
            1;
      return position;
    }

  });

});
