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
      this
        .on("add", this.setParentBlock, this)
        .on("reset", this.setParentBlocks, this);

    },

    setParentBlocks: function() {
      this.each(this.setParentBlock, this);
    },

    setParentBlock: function(model) {
      model.parentBlock = this.parentBlock;
    },

    model: function(attrs, options) {
      console.log(attrs,'>>',options, utils.guessBlockType(attrs))
      var modelClass = models[utils.guessBlockType(attrs) + "Block"]
        , model = new modelClass(attrs, options);
      return model;
    },

    findByName: function(name) {
      return this.find(function(block) {
        return block.get("name") === name;
      });
    }

  });


});
