define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"], function ($, _, Backbone, sg) {

  var collections = sg.collections
    , models = sg.models
    , views = sg.views || (sg.views = {});


  views.ContextMenu = Backbone.View.extend({

    events: {


    },

    initialize: function() {


    },

    render: function() {

      return this;
    }

  });


});
