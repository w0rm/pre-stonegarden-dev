define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "ymaps"
      , "views/alert_form"], function ($, _, Backbone, sg, ymaps) {

  var views = sg.views;

  views.YMaps = Backbone.View.extend({

    template: _.template($("#region-form-template").html()),

    events: {
      "click .js-locate": "locate"
    },

    initialize: function() {
      this.attrs = this.options.attrs || {}
      this.$longitude = this.$("[name=longitude]")
      this.$latitude = this.$("[name=latitude]")
      this.$address = this.$("[name=address]")
      ymaps.ready($.proxy(this.initMap, this))
    },

    updateValues: function() {
      var coordinates = this.placemark.geometry.getCoordinates()
      this.$latitude.val(coordinates[0])
      this.$longitude.val(coordinates[1])
      this.map.panTo(coordinates)
    },

    locate: function(e) {
      var self = this
      e.preventDefault()
      ymaps.geocode(
        this.$address.val(),
        {
          boundedBy: this.map.getBounds(),
          strictBounds: false,
          results: 1
        }
      ).then(
        function (res) {
          if (res.geoObjects.getLength()) {
            var point = res.geoObjects.get(0)
            self.map.panTo(point.geometry.getCoordinates())
            self.placemark.geometry.setCoordinates(
              point.geometry.getCoordinates()
            )
            self.updateValues()
          } else {
            alert("Ничего не найдено!")
          }
        }
      )
    },

    initMap: function() {
      var self = this
        , placemark
        , mapCenter = [
            this.$latitude.val() || 58.521917
          , this.$longitude.val() || 31.274631
          ]
        , zoom = 14
      this.map = new ymaps.Map(this.$(".js-map").get(0), {
        center: mapCenter, zoom: zoom
      })
      this.map.controls.add("smallZoomControl", {left: 10, top: 10})
      this.placemark = new ymaps.Placemark(
        mapCenter,
        {
          iconContent: ""
        },
        {
          draggable: true,
          hasBalloon: false,
          hideIcon: true,
          preset: 'twirl#blueStretchyIcon'
        }
      )
      this.map.geoObjects.add(this.placemark)
      this.map.events.add("click", function (e) {
        self.placemark.geometry.setCoordinates(e.get("coordPosition"))
        self.updateValues()
      })
      this.placemark.events.add(
        "dragend", $.proxy(this.updateValues, this)
      )
    },

    destroyMap: function() {
      this.map && this.map.destroy();
      return this;
    }

  });

});
