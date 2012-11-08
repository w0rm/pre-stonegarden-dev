(function() {
  var $growl, build_contextmenu, dateFromString, timify,
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __slice = Array.prototype.slice;

  timify = function(time) {
    if (time < 10) {
      return "0" + time;
    } else {
      return time;
    }
  };

  window.t_ = function(s) {
    if ((typeof i18n !== "undefined" && i18n !== null) && i18n[s]) {
      return i18n[s];
    } else {
      return s;
    }
  };

  build_contextmenu = function(items) {
    var contextmenu;
    contextmenu = $("<ul class=\"ui-contextmenu\"/>");
    $.each(items, function() {
      var li, link;
      li = $("<li/>").appendTo(contextmenu);
      if (this.separator) {
        return li.addClass("ui-contextmenu-separator");
      } else {
        li.addClass("ui-contextmenu-item");
        if (this.items && this.items.length) {
          return li.append($("<span/>").text(this.text), build_contextmenu(this.items));
        } else {
          if (this.click != null) {
            return li.append($("<a href=\"#\"/>").text(this.text).click((function(item) {
              return function(e) {
                e.preventDefault();
                item.click(e);
                $(".ui-contextmenu-root").removeClass("ui-contextmenu-item");
                setTimeout((function() {
                  return $(".ui-contextmenu-root").remove();
                }), 1000);
                return contextmenu_button.detach();
              };
            })(this)));
          } else {
            link = $("<a/>").text(this.text).attr("href", this.href);
            if (this.target) link.attr("target", this.target);
            return li.append(link);
          }
        }
      }
    });
    return contextmenu;
  };

  window.show_contextmenu = function(items, position) {
    var contextmenu;
    $(".ui-contextmenu-root").remove();
    $("body").one("click", function(e) {
      return $(".ui-contextmenu-root").remove();
    });
    contextmenu = $("<div/>").click(function(e) {
      return e.stopPropagation();
    }).append(build_contextmenu(items)).css({
      left: position.left,
      top: position.top,
      height: 20
    }).appendTo("body");
    return setTimeout((function() {
      contextmenu.addClass("ui-contextmenu-item ui-contextmenu-root active");
      return contextmenu.trigger("mouseenter");
    }), 0);
  };

  window.contextmenu_button = $("<div class=\"ui-show-contextmenu\"><span class=\"ui-icon ui-icon-edzo-menu\"></span></div>");

  $(document).on("mouseenter", ".ui-contextmenu-item, .ui-insert-menu-item", function(e) {
    var left, submenu, top, ui;
    ui = $(this);
    submenu = ui.children(".ui-contextmenu");
    left = ui.offset().left + ui.width();
    top = ui.offset().top + ui.height();
    if (submenu.length > 0) {
      if ($(window).width() + $(window).scrollLeft() - left < submenu.width() + 5) {
        ui.addClass("ui-contextmenu-left");
      } else {
        ui.removeClass("ui-contextmenu-left");
      }
      if ($(window).height() + $(window).scrollTop() - top < submenu.height() + 5) {
        return ui.addClass("ui-contextmenu-top");
      } else {
        return ui.removeClass("ui-contextmenu-top");
      }
    }
  });

  $("button").button();

  dateFromString = function(dateAsString) {
    var parts, pattern;
    pattern = new RegExp("(\\d{4})-(\\d{2})-(\\d{2}) (\\d{2}):(\\d{2}):(\\d{2})");
    parts = dateAsString.match(pattern);
    if (parts) {
      return new Date(parseInt(parts[1], 10), parseInt(parts[2], 10) - 1, parseInt(parts[3], 10), parseInt(parts[4], 10), parseInt(parts[5], 10), parseInt(parts[6], 10), 0);
    } else {
      return null;
    }
  };

  $.extend($.ui.dialog.prototype.options, {
    modal: true,
    close: function() {
      return $(this).remove();
    }
  });

  $.datepicker.regional["ru"] = {
    closeText: "Закрыть",
    prevText: "&#x3c;Пред",
    nextText: "След&#x3e;",
    currentText: "Сегодня",
    monthNames: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
    monthNamesShort: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
    dayNames: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
    dayNamesShort: ["вск", "пнд", "втр", "срд", "чтв", "птн", "сбт"],
    dayNamesMin: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
    weekHeader: "Не",
    dateFormat: "yy.mm.dd",
    firstDay: 1,
    isRTL: false,
    showMonthAfterYear: false,
    yearSuffix: ""
  };

  $.datepicker.setDefaults($.datepicker.regional[$("body").data("lang")]);

  $.fn.dateInput = function() {
    return this.each(function() {
      var altField, dateinput, name, value;
      name = $(this).attr("name");
      value = $(this).val();
      altField = $("<input type=\"text\" readonly />").attr("size", $(this).attr("size")).click(function() {
        return dateinput.datepicker("show");
      });
      dateinput = $("<input />").attr({
        type: "hidden",
        name: name
      }).val(value).datepicker({
        altField: altField,
        altFormat: "d M, yy"
      });
      $(this).before(dateinput).replaceWith(altField);
      return dateinput.datepicker("setDate", dateFromString(value));
    });
  };

  $.fn.datetimeInput = function() {
    return this.each(function() {
      var altField, changevalue, date, dateinput, hoursinput, minutesinput, name, value;
      name = $(this).attr("name");
      value = $(this).val();
      altField = $("<input type=\"text\" readonly />").attr("size", $(this).attr("size")).click(function() {
        return dateinput.datepicker("show");
      });
      dateinput = $("<input />").attr({
        type: "hidden",
        name: name
      }).val(value).datepicker({
        altField: altField,
        altFormat: "d M, yy",
        onSelect: function(year, month, inst) {
          return changevalue();
        }
      }).replaceAll(this);
      changevalue = function(e) {
        var datestring, hours, minutes;
        hours = parseInt(hoursinput.val());
        minutes = parseInt(minutesinput.val());
        if (!hours) hours = 0;
        if (!minutes) minutes = 0;
        if (hours < 0) hours = 0;
        if (hours > 23) hours = 23;
        if (minutes < 0) minutes = 0;
        if (minutes > 59) minutes = 59;
        datestring = $.datepicker.formatDate('yy-mm-dd', dateinput.datepicker("getDate"));
        dateinput.val(datestring + " " + timify(hours) + ":" + timify(minutes) + ":00");
        hoursinput.val(timify(hours));
        minutesinput.val(timify(minutes));
        return true;
      };
      hoursinput = $("<input size=\"2\" maxlength=\"2\" class=\"sg-datetime-hours\" type=\"text\" />").change(changevalue);
      minutesinput = $("<input size=\"2\" maxlength=\"2\" class=\"sg-datetime-minutes\" type=\"text\" />").change(changevalue);
      dateinput.after($("<span class=\"sg-datetime\" />").append(altField, hoursinput, $("<span>:</span>"), minutesinput));
      if (value) {
        date = dateFromString(value);
        hoursinput.val(date.getHours());
        minutesinput.val(date.getMinutes());
        return dateinput.datepicker("setDate", date);
      }
    });
  };

  $("input.date").dateInput();

  $("input.datetime").datetimeInput();

  if ($(".js-address-map").length && (typeof ymaps !== "undefined" && ymaps !== null)) {
    ymaps.ready(function() {
      var map, mapCenter, placemark, zoom;
      mapCenter = [58.521917, 31.274631];
      zoom = 14;
      if ($("#longitude").val() !== "" && parseFloat($("#longitude").val()) !== 0) {
        mapCenter = [$("#latitude").val(), $("#longitude").val()];
      }
      map = new ymaps.Map($(".js-address-map").get(0), {
        center: mapCenter,
        zoom: zoom
      });
      map.controls.add("smallZoomControl", {
        left: 10,
        top: 10
      });
      placemark = new ymaps.Placemark(mapCenter, {}, {
        draggable: true,
        hasBalloon: false,
        hideIcon: true,
        preset: "twirl#blueStretchyIcon"
      });
      map.geoObjects.add(placemark);
      map.events.add("click", function(e) {
        return placemark.geometry.setCoordinates(e.get("coordPosition"));
      });
      placemark.events.add("geometrychange", function(e) {
        var lat, long, _ref;
        _ref = placemark.geometry.getCoordinates(), lat = _ref[0], long = _ref[1];
        $("#longitude").val(long);
        return $("#latitude").val(lat);
      });
      return $(".js-address-locate").click(function(e) {
        var address, dom, geocoder, korpus, stroenie;
        e.preventDefault();
        address = "Великий Новгород, " + $("#address_street").val();
        dom = $("#address_dom").val();
        korpus = $("#address_korpus").val();
        stroenie = $("#address_stroenie").val();
        if (dom) address += ", д. " + dom;
        if (korpus) address += ", к. " + korpus;
        if (stroenie) address += ", стр. " + stroenie;
        geocoder = ymaps.geocode(address, {
          boundedBy: map.getBounds(),
          strictBounds: false,
          results: 1
        });
        geocoder.then(function(res) {
          var point;
          if (res.geoObjects.getLength()) {
            point = res.geoObjects.get(0);
            map.panTo(point.geometry.getCoordinates());
            return placemark.geometry.setCoordinates(point.geometry.getCoordinates());
          } else {
            return alert("Ничего не найдено!");
          }
        });
        return false;
      });
    });
  }

  $growl = $("#notify").notify();

  window.growl = function(template, vars, opts) {
    if (vars.title == null) vars.title = "";
    return $growl.notify("create", "notify-" + template, vars, opts);
  };

  window.debug = function() {
    return $("body").toggleClass("debug");
  };

  $(".flash").each(function() {
    var flash;
    flash = $(this).detach();
    return growl(flash.data("template"), {
      title: flash.attr("title"),
      text: flash.html()
    }, {
      expires: (flash.data("template") === "default" ? 3000 : false)
    });
  });

  window.onerror = function(errorMsg, url, lineNumber) {
    return growl("error", {
      title: t_("Error"),
      text: "" + errorMsg + " in " + url + ", line " + lineNumber
    }, {
      expires: false
    });
  };

  $.ajaxSetup({
    error: function(jqXHR, textStatus, errorThrown) {
      var data;
      if (jqXHR.status !== 412) {
        if (jqXHR.getResponseHeader("content-type") === "application/json") {
          data = $.parseJSON(jqXHR.responseText);
          if (data.redirect != null) return window.location.replace(data.redirect);
        } else {
          return growl("error", {
            title: errorThrown != null ? errorThrown : t_("Error"),
            text: (jqXHR.status === 0 ? t_("Network error.") : jqXHR.responseText)
          }, {
            expires: false
          });
        }
      }
    }
  });

  $(document).on({
    dragenter: function(e) {
      return false;
    },
    dragleave: function(e) {
      return false;
    },
    dragover: function(e) {
      var dt;
      dt = e.originalEvent.dataTransfer;
      if (!dt) return;
      dt.dropEffect = "none";
      return false;
    }
  });

  config.tinymce = {
    script_url: "/static/js/vendor/tiny_mce/tiny_mce.js",
    content_css: "/static/css/tinymce.css",
    theme: "advanced",
    mode: "none",
    language: $("body").data("lang"),
    auto_resize: true,
    object_resizing: false,
    width: "100%",
    relative_urls: false,
    plugins: "table,edzo,contextmenu,paste,fullscreen,visualchars,nonbreaking,inlinepopups,autoresize,save,autosave",
    cleanup_on_startup: true,
    paste_create_paragraphs: true,
    paste_create_linebreaks: true,
    paste_use_dialog: false,
    paste_auto_cleanup_on_paste: true,
    paste_convert_middot_lists: false,
    paste_convert_headers_to_strong: false,
    paste_remove_spans: true,
    paste_remove_styles: true,
    theme_advanced_buttons1: "example,visualchars,undo,pastetext,save,formatselect,styleselect,bold,italic,blockquote,|,bullist,numlist,|,link,unlink,anchor,image,charmap,hr,|,removeformat,code",
    theme_advanced_layout_manager: "SimpleLayout",
    theme_advanced_toolbar_location: "external",
    theme_advanced_path: false,
    theme_advanced_statusbar_location: "none",
    theme_advanced_resizing: false,
    save_enablewhendirty: true,
    valid_elements: config.tinymce_valid_elements,
    setup: function(ed) {
      return ed.onInit.add(function(ed) {
        return ed.focus();
      });
    }
  };

  config.notes_tinymce = $.extend({}, config.tinymce, {
    content_css: "/static/css/notes_tinymce.css",
    plugins: "table,edzo,contextmenu,paste,fullscreen,visualchars,nonbreaking,inlinepopups,save,autosave",
    auto_resize: false,
    height: 350,
    theme_advanced_buttons1: "undo,pastetext,save,bold,italic,|,bullist,numlist,|,link,unlink,anchor,image,|,removeformat,code",
    theme_advanced_toolbar_location: "top",
    valid_elements: config.notes_tinymce_valid_elements
  });

  config.folder = "/a/documents";

  window.openStorage = function(ed, url) {
    var dialog, dialog_form, dialog_title, dialog_wgt, doc_items, img_alt, img_class, img_src, insert_image_size, node;
    dialog = $("<div/>");
    node = ed.selection.getNode();
    dialog_wgt = undefined;
    dialog_title = undefined;
    dialog_form = undefined;
    img_src = undefined;
    img_alt = undefined;
    img_class = undefined;
    insert_image_size = function(doc, k) {
      return function(e) {
        return $.get("/a/documents/" + (doc.data("id")) + "/image_size", {
          size: k
        }, function(data) {
          img_src.val(data.src);
          img_alt.val(data.title);
          if (e.altKey) return dialog_wgt.find(".ui-button").trigger("click");
        });
      };
    };
    doc_items = function(doc) {
      var k, s, sizes, v;
      sizes = ((function() {
        var _ref, _results;
        _ref = config.image;
        _results = [];
        for (k in _ref) {
          v = _ref[k];
          _results.push({
            size: k,
            settings: v
          });
        }
        return _results;
      })()).sort(function(a, b) {
        var a1, b1;
        a1 = a.settings[0] || 999999999;
        b1 = b.settings[0] || 999999999;
        if (a1 > b1) return 1;
        if (a1 < b1) return -1;
        return 0;
      });
      return [
        {
          text: t_("Insert image"),
          click: insert_image_size(doc, "m")
        }, {
          separator: true
        }, {
          text: t_("Sizes") + " →",
          items: (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = sizes.length; _i < _len; _i++) {
              s = sizes[_i];
              _results.push({
                text: t_(config.labels[s.size]) + (s.settings[0] ? " [" + s.settings[0] + "]" : "") + "…",
                click: insert_image_size(doc, s.size)
              });
            }
            return _results;
          })()
        }
      ];
    };
    return $.get(config.folder, {
      filter: true
    }, function(data) {
      dialog.append($(data).find(".ui-documents")).appendTo("body").dialog({
        width: 600,
        height: 500,
        modal: true,
        close: function(ev, ui) {
          contextmenu_button.detach();
          dialog.remove();
          return $("body").trigger("click");
        },
        buttons: [
          {
            text: t_("Insert"),
            click: function() {
              var args;
              if (!img_src.val()) {
                if (node.nodeName === "IMG") ed.dom.remove(node);
              } else {
                args = {
                  src: img_src.val(),
                  alt: img_alt.val(),
                  "class": img_class.val()
                };
                if (node && node.nodeName === "IMG") {
                  ed.dom.setAttribs(node, args);
                } else {
                  ed.execCommand("mceInsertContent", false, "<img id=\"__mce_tmp\" />", {
                    skip_undo: 1
                  });
                  ed.dom.setAttribs("__mce_tmp", args);
                  ed.dom.setAttrib("__mce_tmp", "id", "");
                  ed.undoManager.add();
                }
              }
              $(this).dialog("close");
              ed.execCommand("mceRepaint");
              return ed.focus();
            }
          }
        ]
      });
      dialog_wgt = dialog.dialog("widget");
      dialog_title = dialog_wgt.find(".ui-dialog-title").append($(data).find(".js-documents-breadcrumbs"));
      dialog_form = dialog_wgt.find(".ui-dialog-buttonpane").addClass("ui-gradient").append("<div class=\"small-padding-block\" style=\"overflow:hidden\">            \t    <p><label for=\"img_src\">" + t_("URL") + "</label><input id=\"img_src\" name=\"img_src\" class=\"fullwidth\" type=\"text\"/></p>            \t    <p style=\"white-space:nowrap;\"><label for=\"img_alt\">" + t_("Hint") + "</label><input id=\"img_alt\" name=\"img_alt\" type=\"text\" size=\"15\"/>             \t    <label class=\"before\" style=\"margin-left:10px;\" for=\"img_class\">" + t_("Class") + "</label><input id=\"img_class\" name=\"img_class\" type=\"text\" size=\"15\"/></p>            \t    </div>");
      img_src = dialog_wgt.find("input[name=img_src]");
      img_alt = dialog_wgt.find("input[name=img_alt]");
      img_class = dialog_wgt.find("input[name=img_class]");
      if (node && node.nodeName === "IMG") {
        img_src.val($(node).attr("src"));
        img_alt.val($(node).attr("alt"));
        img_class.val($(node).attr("class"));
      }
      dialog_wgt.on("click", ".js-documents-breadcrumbs a, .ui-document.folder", function(e) {
        var link;
        e.preventDefault();
        link = $(this);
        config.folder = "/a/documents/" + link.data("id");
        return $.get(config.folder, {
          filter: true
        }, function(data) {
          contextmenu_button.detach();
          dialog.html($(data).find(".ui-documents"));
          return dialog_title.html($(data).find(".js-documents-breadcrumbs"));
        });
      });
      return dialog.on("mouseenter", ".ui-document.image", function(e) {
        var doc;
        e.stopPropagation();
        if (!contextmenu_button.parent().is(this)) {
          doc = $(this);
          contextmenu_button.prependTo(this);
          contextmenu_button.off("click");
          return contextmenu_button.on("click", function(e) {
            var coords, items;
            e.preventDefault();
            e.stopPropagation();
            items = doc_items(doc);
            coords = contextmenu_button.offset();
            coords.left += $(this).innerWidth();
            return show_contextmenu(items, coords);
          });
        }
      });
    });
  };

  window.openLink = function(ed, url) {
    var dialog, dialog_title, dialog_wgt, link_class, link_href, link_text, link_title, node, open_sitemap, text_input;
    dialog = $("<div title='" + (t_("Hyperlink")) + "'/>");
    dialog_wgt = void 0;
    dialog_title = void 0;
    link_href = void 0;
    link_title = void 0;
    link_class = void 0;
    link_text = void 0;
    open_sitemap = void 0;
    node = ed.selection.getNode();
    text_input = false;
    dialog.html("<div class=\"small-padding-block\">\n  <p class=\"link_text\">\n    <label for=\"link_text\">" + (t_("Text")) + "</label>\n    <input id=\"link_text\" name=\"link_text\" type=\"text\" class=\"fullwidth\">\n  </p>\n  <p>\n    <label for=\"link_href\">" + (t_("Link")) + "</label>\n    <a class=\"ui-icon-button open_sitemap\" style=\"float:right\"><span class=\"ui-icon ui-icon-edzo-sitemap\"></span></a>\n    <span style=\"display: block; overflow:hidden; position:relative\">\n      <input id=\"link_href\" name=\"link_href\" type=\"text\" class=\"fullwidth\">\n    </span>\n  </p>\n  <p><label for=\"link_title\">" + (t_("Hint")) + "</label><input id=\"link_title\" name=\"link_title\" type=\"text\"></p>\n  <p><label for=\"link_class\">" + (t_("Class")) + "</label><input id=\"link_class\" name=\"link_class\" type=\"text\"></p>\n</div>").appendTo("body").dialog({
      width: 400,
      modal: true,
      close: function(ev, ui) {
        $(this).remove();
        return $("body").trigger("click");
      },
      buttons: [
        {
          text: t_("Create"),
          click: function() {
            var args, i;
            args = {
              title: link_title.val(),
              href: link_href.val(),
              "class": link_class.val()
            };
            if (!args.href) {
              i = ed.selection.getBookmark();
              ed.dom.remove(node, 1);
              ed.selection.moveToBookmark(i);
            } else {
              if (node == null) {
                ed.getDoc().execCommand("unlink", false, null);
                ed.execCommand("mceInsertLink", false, "#mce_temp_url#", {
                  skip_undo: 1
                });
                $(ed.dom.doc).find("a[href='#mce_temp_url#']").each(function() {
                  ed.dom.setAttribs(this, args);
                  if (text_input) $(this).html(link_text.val());
                  return node = this;
                });
                ed.undoManager.add();
              } else {
                ed.dom.setAttribs(node, args);
                if (text_input) $(node).html(link_text.val());
              }
              if (node.childNodes.length !== 1 || node.firstChild.nodeName !== "IMG") {
                ed.focus();
                ed.selection.select(node);
                ed.selection.collapse(0);
              }
            }
            ed.focus();
            return $(this).dialog("close");
          }
        }
      ]
    });
    dialog_wgt = dialog.dialog("widget");
    dialog_title = dialog_wgt.find(".ui-dialog-title").addClass("small-padding-block");
    link_href = dialog.find("input[name=link_href]");
    link_title = dialog.find("input[name=link_title]");
    link_class = dialog.find("input[name=link_class]");
    link_text = dialog.find("input[name=link_text]");
    open_sitemap = dialog.find("a.open_sitemap").click(function(e) {
      e.preventDefault();
      return $.get("/a/sitemap", function(data) {
        dialog = $("<div/>").attr("title", t_("Site map")).append($(data).find(".sitemap")).appendTo("body").dialog({
          modal: true,
          close: function(ev, ui) {
            $(this).remove();
            return $("body").trigger("click");
          },
          buttons: [
            {
              text: t_("Cancel"),
              click: function() {
                return $(this).dialog("close");
              }
            }
          ]
        });
        return dialog.find("a.page-link").click(function(e) {
          e.preventDefault();
          link_href.val("/to/" + $(this).data("id"));
          return dialog.dialog("close");
        });
      });
    });
    node = ed.dom.getParent(node, "A");
    if ((node != null) && node.nodeName === "A") {
      link_href.val($(node).attr("href"));
      link_title.val($(node).attr("title"));
      link_text.val($(node).text());
      link_class.val($(node).attr("class"));
      if ($(node).children().length > 0) {
        return dialog.find(".link_text").remove();
      } else {
        return text_input = true;
      }
    } else {
      return dialog.find(".link_text").remove();
    }
  };

  $.fn.observe = function(time, callback, startCallback) {
    return this.each(function() {
      var form, timer;
      form = $(this);
      timer = false;
      return form.on("change keyup search", ":input", function() {
        if (!$(this).is("[type=text],[type=search]") || $(this).val() !== $(this).data("old_value")) {
          if (startCallback != null) startCallback.call(form);
          clearTimeout(timer);
          timer = setTimeout(function() {
            return callback.call(form);
          }, time * 1000);
          return $(this).data("old_value", $(this).val());
        }
      });
    });
  };

  $.fn.restrict = function() {
    return this.find("[data-role]").each(function() {
      var _ref;
      if (_ref = config.role, __indexOf.call($(this).data("role").split(","), _ref) < 0) {
        return $(this).remove();
      }
    });
  };

  $(document).restrict();

  window.restrict = function() {
    var role;
    role = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return function(method) {
      return function() {
        var _ref;
        if (_ref = config.role, __indexOf.call(role, _ref) >= 0) {
          return method.apply(this, arguments);
        }
      };
    };
  };

  (restrict("admin", "editor")(function() {
    $(document).on("click", ".js-remove-image", function(e) {
      var $imageDrop;
      e.preventDefault();
      $imageDrop = $(this).closest(".js-image-drop");
      $imageDrop.find("img").attr("src", $imageDrop.data("empty_src"));
      $imageDrop.find("input[name=photo_id]").val("");
      return $(this).addClass("hide");
    });
    return $(document).on({
      dragover: function(e) {
        var dt;
        dt = e.originalEvent.dataTransfer;
        if (!((dt != null) && (dt.files != null) && dt.items[0].kind === "file" && !($(this).data("isUploading") != null))) {
          return true;
        }
        dt.dropEffect = "copy";
        $(this).addClass("active");
        return false;
      },
      dragleave: function(e) {
        return $(this).removeClass("active");
      },
      dragenter: function(e) {
        return false;
      },
      drop: function(e) {
        var dt, el, form, status, xhr, xhr_upload,
          _this = this;
        el = $(this);
        dt = e.originalEvent.dataTransfer;
        el.removeClass("active");
        if (!((dt != null) && (dt.files != null))) return true;
        if (typeof FormData === "undefined" || FormData === null) {
          alert("Your browser does not support standard HTML5 Drag and Drop");
          return;
        }
        xhr = new XMLHttpRequest();
        status = $("<span/>").appendTo(el);
        el.closest("form").find("[type=submit]").attr("disabled", true);
        xhr_upload = xhr.upload;
        form = new FormData();
        xhr_upload.addEventListener("progress", (function(e) {
          if (e.lengthComputable) {
            return status.text((e.loaded === e.total ? t_("Processing") : Math.round(e.loaded * 100 / e.total) + "%"));
          }
        }), false);
        xhr_upload.addEventListener("load", (function(e) {}), false);
        xhr_upload.addEventListener("error", (function(error) {
          return status.text("" + (t_("Error")) + ": " + error);
        }), false);
        xhr.open("POST", "/a/documents/upload");
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        xhr.onreadystatechange = function(e) {
          var data;
          if (xhr.readyState === 4) {
            el.removeData("isUploading");
            el.closest("form").find("[type=submit]").removeAttr("disabled");
            if (xhr.status === 200) {
              data = $.parseJSON(e.target.responseText);
              if (data.status === 0) status.text(t_("File upload error!"));
              status.fadeOut(function() {
                return $(this).remove();
              });
              el.find("img").attr("src", data.src);
              el.find("input[name=photo_id]").val(data.id);
              el.find(".js-remove-image").removeClass("hide");
              return $(".js-documents[data-id=" + ($(_this).data("document_id")) + "]").trigger("navigate", [$(_this).data("document_id")]);
            } else {
              status.text(t_("File upload error!"));
              return status.fadeOut(function() {
                return $(this).remove();
              });
            }
          }
        };
        form.append("document_id", $(this).data("document_id"));
        form.append("upload", "image");
        form.append("filename", $(this).data("filename"));
        form.append("files", dt.files[0]);
        $(this).data("isUploading", true);
        xhr.send(form);
        return false;
      }
    }, ".js-image-drop");
  }))();

  $.fn.filterItems = function() {
    var normalizeSearch;
    normalizeSearch = function(idx, el) {
      if ($(el).hasClass("js-search-phone")) {
        return $(el).text().replace(/\D/g, '');
      } else {
        return $(el).text().toLowerCase();
      }
    };
    return this.map(function(idx, el) {
      return {
        element: $(el),
        search_fields: $(el).find(".js-search-field, .js-search-phone").map(normalizeSearch).get(),
        visible: true
      };
    }).get();
  };

  $.fn.alphabet = function(el, title) {
    var $alphabet, letter, _base,
      _this = this;
    letter = "";
    $alphabet = this.find(".js-alphabet");
    $(el).each(function(idx, item) {
      var next_letter;
      next_letter = $(item).find(title).text()[0];
      if (next_letter && next_letter !== letter) {
        $alphabet.append("<li><a href=#" + item.id + ">" + next_letter + "</a></li>");
        return letter = next_letter;
      }
    });
    this.on("click", "a", function(e) {
      e.preventDefault();
      return $(window).scrollTop($($(this).attr("href")).offset().top - 70);
    });
    if (typeof (_base = $("body")).scrollspy === "function") {
      _base.scrollspy({
        offset: 130
      });
    }
    return typeof this.affix === "function" ? this.affix({
      offset: 80
    }) : void 0;
  };

}).call(this);
