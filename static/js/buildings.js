(function() {
  var building_map, delete_building, filterForm, filterItems;

  if ($(".js-building-map").length > 0 && (typeof ymaps !== "undefined" && ymaps !== null)) {
    building_map = $(".js-building-map");
    ymaps.ready(function() {
      var coords, map, placemark;
      coords = [building_map.data("latitude"), building_map.data("longitude")];
      map = new ymaps.Map(building_map.get(0), {
        center: coords,
        zoom: 13
      }, {
        minZoom: 8,
        balloonAutoPanMargin: 120
      });
      placemark = new ymaps.Placemark(coords);
      return map.geoObjects.add(placemark);
    });
  }

  delete_building = function(building) {
    return function(e) {
      var dialog;
      dialog = $("<div/>").attr("title", "Удаление дома");
      return dialog.append($("<p/>").text("Вы действительно хотите удалить дом?")).appendTo("body").dialog({
        buttons: [
          {
            text: t_("Delete"),
            click: function() {
              return $.post("/a/buildings/" + (building.data("id")) + "/delete", function(data) {
                contextmenu_button.detach();
                if (building.is(".ui-building")) {
                  building.remove();
                  growl("default", {
                    text: "Дом удалён"
                  }, {
                    expires: 3000
                  });
                  return dialog.dialog("close");
                } else {
                  return location.replace("/a/buildings");
                }
              });
            }
          }, {
            text: t_("Cancel"),
            click: function() {
              return $(this).dialog("close");
            }
          }
        ]
      });
    };
  };

  (restrict("admin", "editor")(function() {
    $(document).on("mouseenter", ".ui-building", function(e) {
      var building;
      if (!contextmenu_button.parent().is(this)) {
        building = $(this);
        contextmenu_button.prependTo(this);
        contextmenu_button.off("click");
        return contextmenu_button.on("click", function(e) {
          var coords, items;
          e.preventDefault();
          e.stopPropagation();
          items = [
            {
              text: t_("Edit"),
              href: "/a/buildings/" + (building.data("id")) + "/edit"
            }, {
              text: t_("Delete"),
              click: delete_building(building)
            }
          ];
          coords = $(this).offset();
          coords.left += $(this).innerWidth();
          return show_contextmenu(items, coords);
        });
      }
    });
    return $(".js-building-profile").on("mouseenter", function(e) {
      var building;
      building = $(this);
      if (!contextmenu_button.parent().is(".js-building-address")) {
        contextmenu_button.prependTo($(this).find(".js-building-address"));
        contextmenu_button.off("click");
        return contextmenu_button.on("click", function(e) {
          var coords, items;
          e.preventDefault();
          e.stopPropagation();
          items = [
            {
              text: t_("Edit"),
              href: "/a/buildings/" + (building.data("id")) + "/edit"
            }, {
              text: t_("Delete"),
              click: delete_building(building)
            }
          ];
          coords = $(this).offset();
          coords.left += $(this).innerWidth();
          return show_contextmenu(items, coords);
        });
      }
    });
  }))();

  if ($.fn.alphabet) $(".js-filter-form").alphabet(".ui-building", ".js-address");

  filterItems = $(".ui-building").filterItems();

  filterForm = $(".js-filter-form").observe(0.5, function() {
    var b, field, fields_matched, form, results, search, search_tokens, token, tokens_matched, _i, _j, _k, _len, _len2, _len3, _ref;
    form = $(this);
    search = form.find("[name='search']").val().toLowerCase();
    search_tokens = search.split(" ");
    results = 0;
    for (_i = 0, _len = filterItems.length; _i < _len; _i++) {
      b = filterItems[_i];
      tokens_matched = true;
      for (_j = 0, _len2 = search_tokens.length; _j < _len2; _j++) {
        token = search_tokens[_j];
        fields_matched = false;
        _ref = b.search_fields;
        for (_k = 0, _len3 = _ref.length; _k < _len3; _k++) {
          field = _ref[_k];
          if (field.toLowerCase().indexOf(token) >= 0) {
            fields_matched = true;
            break;
          }
        }
        if (!fields_matched) {
          tokens_matched = false;
          break;
        }
      }
      if (tokens_matched || !(search != null)) {
        results += 1;
        if (!b.visible) {
          b.element.show();
          b.visible = true;
        }
      } else {
        if (b.visible) {
          b.element.hide();
          b.visible = false;
        }
      }
      if (search) {
        this.find(".js-filter-results").removeClass("load").text("Найдено: " + results);
      } else {
        this.find(".js-filter-results").removeClass("load").text("");
      }
    }
    this.find(".js-alphabet").empty();
    return this.alphabet(".ui-building", ".js-address");
  }, function() {
    return this.find(".js-filter-results").addClass("load").text("Идёт поиск");
  });

  filterForm.submit(function(e) {
    return e.preventDefault();
  });

}).call(this);
