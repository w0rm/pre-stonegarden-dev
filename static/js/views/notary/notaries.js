define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/modal"
      , "views/notary/notary_form"
      , "views/notary/notary"], function ($, _, Backbone, sg) {

  var utils = sg.utils
    , views = sg.views;


  views.Notaries = Backbone.View.extend({

    template: _.template($("#notaries-template").html()),

    events: {
      "click .js-create-notary": "createNotary"
    },

    render: function() {
      this.$el.html(this.template({region: this.model.toJSON()}));
      this.$notaries = this.$(".js-notaries");
      this.collection.each(this.appendNotary, this);
      return this;
    },

    openRegion: function(region) {
      this.collection && this.collection.off(null, null, this)
      this.model = region
      this.collection = region.notaries
        .on("add", this.appendNotary, this)
        .on("reset", this.render, this)
      this.model.fetchNotaries()
    },

    appendNotary: function(model, collection, options) {
      this.$notaries.append(
        new views.Notary({
          model: model,
          isContextMenuEnabled: true
        }).render().el
      )
      return this;
    },

    createNotary: function() {
      new views.Modal({
        contentView: new views.NotaryForm({
          collection: this.collection,
          attrs: {region_id: this.model.get("id")},
          region: this.model.toJSON()
        }),
        sizeClass: "xlarge"
      }).open();
    }

  });

});
