define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/modal"
      , "views/notary/regions"
      , "views/notary/notaries"], function ($, _, Backbone, sg) {

  var utils = sg.utils
    , views = sg.views;


  views.NotaryRegions = Backbone.View.extend({

    template: _.template($("#notary-regions-template").html()),

    initialize: function() {
      this.collection.on("region:showNotaries", this.showNotaries, this);
    },

    render: function() {
      this.$el.html(this.template());

      this.regionsView = new views.Regions({
        el: this.$(".js-notary-regions"),
        collection: this.collection
      }).render()

      this.notariesView = new views.Notaries({
        el: this.$(".js-notary-notaries")
      })

      return this;
    },

    showNotaries: function(model) {
      this.notariesView.openRegion(model)
    }

  });

});
