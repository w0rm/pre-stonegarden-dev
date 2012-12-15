define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "utils"
      , "views/contextmenu"], function ($, _, Backbone, sg) {

  var mixins = sg.mixins || (sg.mixins = {})
    , views = sg.views;


  mixins.hasContextMenu = {

    events: {
      "mouseenter": "showContextMenu",
      "mouseleave": "hideContextMenu"
    },

    hasContextMenu: function(e) {
      return this.model.hasContextMenu() && this.options.isContextMenuEnabled;
    },

    showContextMenu: function(e) {
      if (this.hasContextMenu()) {
        e.stopPropagation()
        this.$el.prepend(
          this.getContextMenu().render().el
        );
        this.trigger("contextmenu:show");
      }
    },

    hideContextMenu: function() {
      if (this.hasContextMenu()) {
        this.getContextMenu().$el.detach();
        this.trigger("contextmenu:hide");
      }
    },

    getContextMenu: function() {
      return (
        this.contextMenu ||
        (this.contextMenu = new views.ContextMenu({model: this.model}))
      );
    }

  };

  return mixins.hasContextMenu;


});
