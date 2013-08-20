define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "utils"
      , "models/model"
      , "models/notary/notaries"], function ($, _, Backbone, sg) {

  var models = sg.models


  models.Notary =  models.Model.extend({

    urlRoot: "/a/notaries",

    getDeleteOptions: function() {
      return {
        title: "Вы действительно хотите удалить этого нотариуса?",
        message: "Фотографии нотариуса нужно удалить отдельно в складе."
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
      this.trigger("notary:delete");
    },

    edit: function() {
      this.trigger("notary:edit");
    },

    highlight: function() {
      this.trigger("notary:highlight");
    },

    lowlight: function() {
      this.trigger("notary:lowlight");
    }


  });

});
