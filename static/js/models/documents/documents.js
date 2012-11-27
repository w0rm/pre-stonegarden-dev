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

    initialize: function() {
      this.on("add remove", this.updatePositions, this);
    },

    updatePositions: function(model, collection, options) {
      this.each(function(m, index) {
        m.set({position: index + 1});
      })
    },

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
