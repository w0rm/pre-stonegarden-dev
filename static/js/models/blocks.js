define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "utils"], function ($, _, Backbone, sg) {


  var collections = sg.collections || (sg.collections = {})
    , models = sg.models || (sg.models = {})
    , utils = sg.utils;


  collections.Blocks = Backbone.Collection.extend({

    url: "/a/blocks",

    model: function(attrs, options) {
      var modelClass = models[utils.guessBlockType(attrs) + "Block"];
      return new modelClass(attrs, options);
    }

  });


});
