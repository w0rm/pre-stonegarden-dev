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

    initialize: function() {
      this.on("add", this.setParentBlock, this);
    },

    setParentBlock: function(model) {
      model.parentBlock = this.parentBlock;
    },

    model: function(attrs, options) {
      var modelClass = models[utils.guessBlockType(attrs) + "Block"]
        , model = new modelClass(attrs, options);
        return model;
    }

  });


});
