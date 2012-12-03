define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "utils"
      , "models/model"
      , "models/blocks/blocks"], function ($, _, Backbone, sg) {

  var models = sg.models;


  models.Page =  models.Model.extend({

    urlRoot: "/a/pages",

    edit: function() {
      this.trigger("page:edit");
    },

    delete: function() {
      this.trigger("page:delete");
    },

    editCode: function() {
      this.trigger("page:code");
    }

  });

  return models.Page;

});
