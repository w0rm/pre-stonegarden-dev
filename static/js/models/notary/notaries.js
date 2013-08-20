define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "utils"
      , "models/notary/notary"], function ($, _, Backbone, sg) {

  var collections = sg.collections || (sg.collections = {})
    , models = sg.models
    , utils = sg.utils;

  collections.Notaries = Backbone.Collection.extend({

    model: models.Notary,

    url: "/a/notaries"

  });

});
