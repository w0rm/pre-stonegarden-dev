define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "./context_menu"], function ($, _, Backbone, sg) {

  var collections = sg.collections
    , models = sg.models
    , views = sg.views || (sg.views = {});


  views.BlockInserter = Backbone.View.extend({

    className: "sg-block-inserter js-inserter",

    events: {
      "mousemove": "mousemoveEvent"
    },

    mousemoveEvent: function(e) {
      e.preventDefault();
    }

  });


});
