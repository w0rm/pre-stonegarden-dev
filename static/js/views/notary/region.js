define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/mixins/has_contextmenu"
      , "views/modal"
      , "views/delete_modal"
      , "views/notary/region_form"], function ($, _, Backbone, sg) {

  var utils = sg.utils
    , views = sg.views
    , mixins = sg.mixins;

  views.Region = Backbone.View.extend(_.extend({}, mixins.hasContextMenu, {

    tagName: "li",

    className: "sg-region",

    template: _.template($("#region-template").html()),

    events: _.extend({
      "click .js-show-notaries": "showNotaries"
    }, mixins.hasContextMenu.events),

    initialize: function() {
      this.model
        .on("region:delete", this.deleteRegion, this)
        .on("region:edit", this.editRegion, this)
        .on("destroy", this.remove, this)
        .on("change:title", this.render, this)
    },

    render: function() {
      this.$el
        .html(this.template({"region": this.model.toJSON()}));
      return this;
    },

    deleteRegion: function() {
      new views.DeleteModal({model: this.model}).open();
    },

    editRegion: function() {
      new views.Modal({
        contentView: new views.RegionForm({model: this.model}),
        sizeClass: "large"
      }).open();
    },

    showNotaries: function(e) {
      e.preventDefault()
      this.model.trigger("region:showNotaries", this.model);
    }

  }));

});
