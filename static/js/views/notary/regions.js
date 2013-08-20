define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/modal"
      , "views/notary/region_form"
      , "views/notary/region"], function ($, _, Backbone, sg) {

  var utils = sg.utils
    , views = sg.views;


  views.Regions = Backbone.View.extend({

    template: _.template($("#regions-template").html()),

    events: {
      "click .js-create-region": "createRegion"
    },

    initialize: function() {
      this.collection
        .on("add", this.appendRegion, this)
        .on("reset", this.render, this)
    },

    render: function() {
      this.$el.html(this.template());
      this.$regions = this.$(".js-regions");
      this.collection.each(this.appendRegion, this);
      return this;
    },

    appendRegion: function(model, collection, options) {
      this.$regions.append(
        new views.Region({
          model: model,
          isContextMenuEnabled: true
        }).render().el
      )
      return this;
    },

    createRegion: function() {
      new views.Modal({
        contentView: new views.RegionForm({collection: this.collection}),
        sizeClass: "large"
      }).open();
    }

  });

});
