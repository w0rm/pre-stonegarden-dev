define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "utils"
      , "models/model"
      , "models/blocks/blocks"], function ($, _, Backbone, sg) {

  var models = sg.models;


  models.Page =  models.Model.extend({

    urlRoot: "/a/pages"

  });

  return models.Page;

});
