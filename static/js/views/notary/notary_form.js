define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/alert_form"
      , "views/notary/ymaps"
      , "views/documents/image_upload"], function ($, _, Backbone, sg) {

  var views = sg.views;

  views.NotaryForm = views.AlertForm.extend({

    events: _.extend({
      "click .js-label": "toggleLateDay"
    }, views.AlertForm.prototype.events),

    template: _.template($("#notary-form-template").html()),

    initialize: function() {
      this.attrs = this.options.attrs || {}
      this.on("reset", function(){
        this.mapView.destroyMap()
      })
    },

    serializeObject: function() {
      return _.extend(
        this.attrs,
        sg.utils.serializeObject(this.$el)
      );
    },

    getTemplateAttributes: function() {
      notary = this.hasModel() ? this.model.toJSON() : {}
      return {
        hasModel: this.hasModel(),
        notary: notary,
        region: this.options.region || {}
      };
    },

    toggleLateDay: function(e) {
      e.preventDefault()
      $(e.currentTarget).toggleClass("sg-active");
      this.$late_days.val(
        this.$(".sg-active.js-label").map(function() {
          return $(this).data("value");
        }).get().join()
      )
    },

    initLateDays: function() {
      this.$labels = this.$(".js-label")
      this.$late_days = this.$("[name=late_days]")
      this.$("[name=description]").tinymce(
        _.extend({}, sg.config.tinymce, {
          theme_advanced_toolbar_location: "top",
          theme_advanced_buttons1: "styleselect,bold,italic,|,bullist,|,link,unlink,|,removeformat,code",
        })
      );
      if (this.hasModel()) {
        late_days = this.model.get("late_days").split(",")
        this.$labels.each(function() {
          $(this).toggleClass(
            "sg-active",
            _.contains(late_days, "" + $(this).data("value"))
          )
        })
      }
      return this;
    },

    render: function() {
      var late_days
      this.$el.html(this.template(this.getTemplateAttributes()))
      this.mapView = new views.YMaps({el: this.$(".js-location")})
      this.initLateDays()
      new views.ImageUpload({el: this.$(".js-office_image-upload")})
      new views.ImageUpload({el: this.$(".js-notary_image-upload")})
      return this;
    }

  });

});
