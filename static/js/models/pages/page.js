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

    create: function() {
      this.trigger("page:create");
    },

    editCode: function() {
      this.trigger("page:code");
    },

    getIndentedName: function() {
      return new Array(this.get("level") + 1).join("    ") + this.get("name");
    }

  });

  return models.Page;

});
