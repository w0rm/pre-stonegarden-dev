define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "utils"
      , "models/pages/page"], function ($, _, Backbone, sg) {

  var collections = sg.collections || (sg.collections = {})
    , models = sg.models
    , utils = sg.utils;

  collections.Pages = Backbone.Collection.extend({

    model: models.Page,

    url: "/a/pages",

    initialize: function() {
      this.on("add remove", this.updatePositions, this);
    },

    updatePositions: function(model, collection, options) {
      this.each(function(m, index) {
        m.set({position: index + 1});
      })
    },

    getIndentedList: function() {
      return this.map(function(page) {
        return {
          id: page.get("id"),
          name: page.getIndentedName()
        }
      });
    }

  });

});
