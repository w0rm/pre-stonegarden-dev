define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/modal"
      , "views/documents/form"
      , "views/documents/list"], function ($, _, Backbone, sg) {

  var utils = sg.utils
    , views = sg.views;

  views.DocumentStorage = Backbone.View.extend({

    template: _.template($("#document-storage-template").html())

  });

});
