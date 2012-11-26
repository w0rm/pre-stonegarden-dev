define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/contextmenu"
      , "views/modal"
      , "views/documents/form"], function ($, _, Backbone, sg) {

  var utils = sg.utils
    , views = sg.views;

  views.DocumentList = Backbone.View.extend({

    template: _.template($("#document-list-template").html())


  });

});
