define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/alert_form"
      , "views/notary/ymaps"], function ($, _, Backbone, sg) {

  var views = sg.views;

  views.RegionForm = views.AlertForm.extend({

    template: _.template($("#region-form-template").html()),

    initialize: function() {
      this.attrs = this.options.attrs || {};
      this.on("reset", function(){
        this.mapView.destroyMap()
      })
    },

    getTemplateAttributes: function() {
      region = this.hasModel() ? this.model.toJSON() : {};
      return {
        hasModel: this.hasModel(),
        region: region
      };
    },

    render: function() {
      this.$el.html(this.template(this.getTemplateAttributes()))
      this.mapView = new views.YMaps({el: this.$(".js-location")})
      return this;
    }

  });

});
