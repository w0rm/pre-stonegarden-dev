define(["jquery", "ymaps"], function($, ymaps) {

  $.fn.notariesMap = function(){

    var $element = $(this)
      , $map = $element.find(".js-map")
      , $form = $element.find(".js-filter")
      , $region = $element.find(".js-region")
      , $lateHours = $element.find(".js-late")
      , map
      , cluster
      , placemarks

    if ($element.length !== 1) return;

    function add_location() {
      var balloonContentBody = (
        "<div class='map-notary'>" +
          (this.office_image ?
            "<img class='map-notary-image' " +
            "data-lightbox='" + this.office_image.sizes.m + "' " +
            "src='" + this.office_image.sizes.s + "'>" : ""
          ) +
          "<p>" +  this.address + "</p>" +
          (this.phone ? "<p>" + this.phone + "</p>" : "") +
          "<div class='map-notary-description'>" + this.description + "</div>" +
        "</div>"
      )
      var placemark = new ymaps.Placemark([this.latitude, this.longitude], {
        balloonContentBody: balloonContentBody,
        balloonContentHeader: "<strong>" + this.title + "</strong>",
        clusterCaption: "<strong>" + this.title + "</strong>"
      })
      placemarks.push(placemark)
      cluster.add(placemark)
    };

    function getBounds(placemarks) {
      var first_run, max_lat, max_long, min_lat, min_long;
      min_lat = min_long = max_lat = max_long = 0;
      first_run = true;
      $.each(placemarks, function(a, i) {
        var lat, long, _ref;
        _ref = i.geometry.getCoordinates(), lat = _ref[0], long = _ref[1];
        if (first_run) {
          first_run = false;
          min_lat = max_lat = lat;
          return min_long = max_long = long;
        } else {
          min_lat = Math.min(min_lat, lat);
          max_lat = Math.max(max_lat, lat);
          min_long = Math.min(min_long, long);
          return max_long = Math.max(max_long, long);
        }
      });
      return [[min_lat, min_long], [max_lat, max_long]];
   }


    ymaps.ready(function(){

      $map.css({height: 500, marginBottom: -50});

      map = new ymaps.Map($map.get(0), {
        center: [58.521917, 31.274631],
        zoom: 14
      }, {
        minZoom: 8
      });

      cluster = new ymaps.Clusterer();
      map.geoObjects.add(cluster);
      map.controls.add("zoomControl", {
        left: 40,
        top: 100
      });

      $form.submit(function(e){

        var placemark
          , dayOfWeek = "" + (new Date).getDay()

        e.preventDefault()
        cluster.removeAll()
        placemarks = []

        $.each(sgData.notaries_for_map, function(){
          if (this.region_id == $region.val() &&
              (!$lateHours.is(":checked") ||
               $.inArray(dayOfWeek, this.late_days) >= 0)) {
            add_location.call(this)
          }
        });

        if (placemarks.length > 1) {
          return map.setBounds(getBounds(placemarks), {
            duration: 500
          });
        } else if (placemarks.length === 1) {
          map.setCenter(placemarks[0].geometry.getCoordinates(), 14)
        }

      }).submit()

    })


  }


  return $.fn.notariesMap

})
