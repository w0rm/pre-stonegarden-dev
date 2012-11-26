define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "utils"
      , "models/model"], function ($, _, Backbone, sg) {

  var models = sg.models;


  models.Document =  models.Model.extend({

    urlRoot: "/a/documents"

  });

});
