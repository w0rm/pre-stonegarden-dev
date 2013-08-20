define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/mixins/has_contextmenu"
      , "views/modal"
      , "views/delete_modal"
      , "views/notary/notary_form"], function ($, _, Backbone, sg) {

  var utils = sg.utils
    , views = sg.views
    , mixins = sg.mixins;

  views.Notary = Backbone.View.extend(_.extend({}, mixins.hasContextMenu, {

    tagName: "li",

    className: "sg-notary",

    template: _.template($("#notary-template").html()),

    events: _.extend({}, mixins.hasContextMenu.events),

    initialize: function() {
      this.model
        .on("notary:delete", this.deleteNotary, this)
        .on("notary:edit", this.editNotary, this)
        .on("destroy", this.remove, this)
        .on("change:title", this.render, this)
    },

    render: function() {
      this.$el
        .html(this.template({"notary": this.model.toJSON()}));
      return this;
    },

    deleteNotary: function() {
      new views.DeleteModal({model: this.model}).open();
    },

    editNotary: function() {
      new views.Modal({
        contentView: new views.NotaryForm({model: this.model}),
        sizeClass: "xlarge"
      }).open();
    }

  }));

});
