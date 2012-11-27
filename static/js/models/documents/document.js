define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "utils"
      , "models/model"], function ($, _, Backbone, sg) {

  var models = sg.models;


  models.Document =  models.Model.extend({

    urlRoot: "/a/documents",


    isSystem: function() {
      return !!this.get("is_system");
    },

    // Contextmenu items

    hasContextMenu: function() {
      return true;
    },

    getContextMenu: function() {
      var items = []
        , parentMenu;

      items.push({
        text: t_("Attributes"),
        click: this.editAttributes
      });

      if (!this.isSystem()) {
        // System and container blocks cannot be deleted
        items.push({
          text: t_("Delete"),
          click: this.delete
        });
      };

      return {
        items: items,
        context: this
      };

    },

    highlight: function() {
      this.trigger("document:highlight");
    },

    lowlight: function() {
      this.trigger("document:lowlight");
    },

    delete: function() {
      this.trigger("document:delete");
    },

    editAttributes: function() {
      this.trigger("document:attributes");
    }


  });

});
