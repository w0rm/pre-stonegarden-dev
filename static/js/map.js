(function() {

  ymaps.ready(function() {
    var add_location, buildings, cluster, colors, getBounds, map, map_latitude, map_longitude, map_zoom, render, xhr;
    map_longitude = 31.27500;
    map_latitude = 58.525000;
    map_zoom = 13;
    colors = ["lightblue", "white", "green", "red", "yellow", "darkblue", "night", "grey", "blue", "orange", "darkorange", "pink", "violet"];
    add_location = function() {
      var balloonContentBody;
      balloonContentBody = "<a class=\"map-address\" href=\"/a/buildings/" + this.id + "\">\n      <p>" + this.address_cached + "</p>";
      if (this.photo_filename != null) {
        balloonContentBody += "<p><img src=\"/static/i/" + this.photo_filename + "_t" + this.photo_extension + "\" width=\"120\" ></p>";
      }
      balloonContentBody += "</a>";
      return new ymaps.Placemark([this.latitude, this.longitude], {
        balloonContentBody: balloonContentBody
      }, {
        preset: "twirl#" + colors[this.department_id] + "Icon"
      });
    };
    getBounds = function(collection) {
      var first_run, max_lat, max_long, min_lat, min_long;
      min_lat = min_long = max_lat = max_long = 0;
      first_run = true;
      collection.each(function(i) {
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
      return [[58.49 < min_lat ? min_lat : 58.49, 31.21 < min_long ? min_long : 31.21], [58.56 > max_lat ? max_lat : 58.56, 31.33 > max_long ? max_long : 31.33]];
    };
    $(".ui-map").css({
      height: 500
    });
    map = new ymaps.Map($(".ui-map").get(0), {
      center: [map_latitude, map_longitude],
      zoom: map_zoom
    }, {
      minZoom: 8,
      balloonAutoPanMargin: 120
    });
    cluster = new ymaps.GeoObjectArray();
    map.geoObjects.add(cluster);
    map.controls.add("zoomControl", {
      right: 10,
      top: 10
    });
    if (xhr) xhr.abort();
    buildings = [];
    render = function(bs) {
      var placemark;
      if (cluster.getLength() > 1) {
        return map.setBounds(getBounds(cluster), {
          duration: 500
        });
      } else if (cluster.getLength() === 1) {
        placemark = cluster.getIterator().getNext();
        map.setCenter(placemark.geometry.getCoordinates(), map_zoom);
        return placemark.balloon.open();
      }
    };
    return xhr = $.get("/a/buildings.json", function(json) {
      var b, filterForm, _i, _len;
      buildings = json.buildings;
      for (_i = 0, _len = buildings.length; _i < _len; _i++) {
        b = buildings[_i];
        b.placemark = add_location.call(b);
        cluster.add(b.placemark);
      }
      render(buildings);
      filterForm = $(".js-filter-form").observe(0.5, function() {
        var b, department_id, search, search_found, search_tokens, show_department, token, _j, _k, _len2, _len3;
        search = this.find("[name='search']").val().toLowerCase();
        search_tokens = search.split(" ");
        show_department = this.find("[name='show_department']").is(':checked');
        department_id = this.find("[name='department_id']").val();
        for (_j = 0, _len2 = buildings.length; _j < _len2; _j++) {
          b = buildings[_j];
          search_found = true;
          for (_k = 0, _len3 = search_tokens.length; _k < _len3; _k++) {
            token = search_tokens[_k];
            if (b.address_cached.toLowerCase().indexOf(token) < 0) {
              search_found = false;
              break;
            }
          }
          if ((show_department && b.department_id === parseInt(department_id) || !show_department) && (search_found || !(search != null))) {
            if (cluster.indexOf(b.placemark) < 0) cluster.add(b.placemark);
          } else {
            if (!(cluster.indexOf(b.placemark) < 0)) cluster.remove(b.placemark);
          }
        }
        render(buildings);
        if (search) {
          return this.find(".js-filter-results").removeClass("load").text("Найдено: " + (cluster.getLength()));
        } else {
          return this.find(".js-filter-results").removeClass("load").text("");
        }
      }, function() {
        return this.find(".js-filter-results").addClass("load").text("Идёт поиск");
      });
      filterForm.submit(function(e) {
        return e.preventDefault();
      });
      return filterForm.find("[name='department_id']").change(function() {
        return filterForm.find("[name='show_department']").attr("checked", "checked");
      });
    });
  });

}).call(this);
