define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"], function ($, _, Backbone, sg) {


  var collections = sg.collections || (sg.collections = {})
    , models = sg.models || (sg.models = {});


  collections.Blocks = Backbone.Collection.extend({

    url: "/a/blocks",

    model: function(attrs, options) {
      switch (attrs.template) {
        case "page":
          model = new models.ColumnBlock(attrs, options);
          break;
        case "column":
          model = new models.ColumnBlock(attrs, options);
          break;
        case "row":
          model = new models.RowBlock(attrs, options);
          break;
        default:
          model = new models.Block(attrs, options);
          break;
      }
      return model;
    }

  });


  models.Block = Backbone.Model.extend({

    urlRoot: "/a/blocks",

    initialize: function() {
      this.blocks = new collections.Blocks;
    },

    parse: function(response) {
       if (response && response.blocks) {
        this.blocks.reset(response.attachments, {silent: true});
      }
      return Backbone.Model.prototype.parse.call(this, response);
    }

  });

});
