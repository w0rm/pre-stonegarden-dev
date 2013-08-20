define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "utils"
      , "models/model"
      , "models/notary/notaries"], function ($, _, Backbone, sg) {

  var models = sg.models
    , collections = sg.collections;


  models.Region =  models.Model.extend({

    urlRoot: "/a/regions",

    initialize: function() {
      this.notaries = new collections.Notaries
    },

    fetchNotaries: function() {
      return this.notaries.fetch({data: {region_id: this.get("id")}})
    },

    getDeleteOptions: function() {
      return {
        title: "Вы действительно хотите удалить этот нотариальный округ?",
        message: "Удаляя его вы удалите всех нотариусов этого округа."
      }
    },

    // Contextmenu items

    hasContextMenu: function() {
      return true;
    },

    getContextMenu: function() {
      var items = []
        , parentMenu;

      items.push({
        text: t_("Edit"),
        click: this.edit
      });

      items.push({
        text: t_("Delete"),
        click: this.delete
      });

      return {
        items: items,
        context: this
      };

    },

    delete: function() {
      this.trigger("region:delete");
    },

    edit: function() {
      this.trigger("region:edit");
    },

    highlight: function() {
      this.trigger("region:highlight");
    },

    lowlight: function() {
      this.trigger("region:lowlight");
    }


  });

});
