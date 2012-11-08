(function() {
  var create_contact, delete_contact, detach_contact, edit_contact, filterForm, filterItems;

  edit_contact = function(contact) {
    return function(e) {
      return $.get("/a/contacts/" + (contact.data("id")) + "/edit", function(data) {
        var dialog;
        dialog = $("<div title='Редактирование сотрудника' />");
        return dialog.append(data).appendTo("body").on("submit", "form", function(e) {
          e.preventDefault();
          return $.post("/a/contacts/" + (contact.data("id")) + "/edit", $(this).serialize()).done(function(data) {
            contextmenu_button.detach();
            dialog.dialog("close");
            if (contact.is(".ui-contact")) {
              return contact.replaceWith($(data).attr("data-occupation_id", contact.data("occupation_id")));
            } else {
              return location.replace(location.href);
            }
          }).fail(function(jqXHR) {
            return dialog.html(jqXHR.responseText).find("button").button();
          });
        }).on("click", ".js-cancel", function(e) {
          e.preventDefault();
          return dialog.dialog("close");
        }).dialog({
          width: 630
        }).find("button").button();
      });
    };
  };

  delete_contact = function(contact) {
    return function(e) {
      var dialog;
      dialog = $("<div/>").attr("title", "Удаление сотрудника или партнёра");
      return dialog.append($("<p/>").text("Вы действительно хотите удалить сотрудника или партнёра?")).appendTo("body").dialog({
        buttons: [
          {
            text: t_("Delete"),
            click: function() {
              return $.post("/a/contacts/" + (contact.data("id")) + "/delete", function(data) {
                contextmenu_button.detach();
                if (contact.is(".ui-contact")) {
                  contact.remove();
                  growl("default", {
                    text: "Сотрудник или партнёр удалён"
                  }, {
                    expires: 3000
                  });
                  return dialog.dialog("close");
                } else {
                  return location.replace("/a/contacts");
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

  detach_contact = function(contact) {
    return function(e) {
      var dialog;
      dialog = $("<div/>").attr("title", "Убрать сотрудника или партнёра");
      return dialog.append($("<p/>").text("Вы действительно хотите убрать сотрудника или партнёра из дома?")).appendTo("body").dialog({
        buttons: [
          {
            text: "Убрать",
            click: function() {
              return $.post("/a/contacts/" + (contact.data("id")) + "/detach", [
                {
                  name: "occupation_id",
                  value: contact.data("occupation_id")
                }
              ], function(data) {
                contextmenu_button.detach();
                contact.remove();
                growl("default", {
                  text: "Сотрудник или партнёр убран из дома"
                }, {
                  expires: 3000
                });
                return dialog.dialog("close");
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

  create_contact = function(e) {
    var button;
    e.preventDefault();
    e.stopPropagation();
    button = $(this);
    return $.get("/a/contacts/new", function(data) {
      var dialog;
      dialog = $("<div title='Новый сотрудник или партнёр'>");
      return dialog.append(data).appendTo("body").on("submit", "form", function(e) {
        var params;
        e.preventDefault();
        params = $(this).serializeArray();
        if (button.data("building_id") != null) {
          params.push({
            name: "building_id",
            value: button.data("building_id")
          });
          params.push({
            name: "container",
            value: button.data("container")
          });
        }
        return $.post("/a/contacts/new", params).done(function(data) {
          contextmenu_button.detach();
          if (button.data("container") != null) {
            $(data).prependTo(".js-contacts[data-container=" + (button.data('container')) + "]").effect("highlight", {}, 1000);
          } else {
            $(data).prependTo(".js-contacts").effect("highlight", {}, 1000);
          }
          return dialog.dialog("close");
        }).fail(function(jqXHR) {
          return dialog.html(jqXHR.responseText).find("button").button();
        });
      }).on("click", ".js-cancel", function(e) {
        e.preventDefault();
        return dialog.dialog("close");
      }).dialog({
        width: 630
      }).find("button").button();
    });
  };

  (restrict("admin", "editor")(function() {
    $(document).on("click", ".js-new-contact", create_contact);
    $(document).on("mouseenter", ".ui-contact", function(e) {
      var contact;
      e.stopPropagation();
      if (!contextmenu_button.parent().is(this)) {
        contact = $(this);
        contextmenu_button.prependTo(this);
        contextmenu_button.off("click");
        return contextmenu_button.on("click", function(e) {
          var coords, items;
          e.preventDefault();
          e.stopPropagation();
          items = [
            {
              text: t_("Edit"),
              click: edit_contact(contact)
            }, contact.data("occupation_id") ? {
              text: "Убрать",
              click: detach_contact(contact)
            } : {
              text: t_("Delete"),
              click: delete_contact(contact)
            }
          ];
          coords = $(this).offset();
          coords.left += $(this).innerWidth();
          return show_contextmenu(items, coords);
        });
      }
    });
    $(".js-contact-profile").on("mouseenter", function(e) {
      var contact;
      contact = $(this);
      if (!contextmenu_button.parent().is(".js-contact-title")) {
        contextmenu_button.prependTo(".js-contact-title");
        contextmenu_button.off("click");
        return contextmenu_button.on("click", function(e) {
          var coords, items;
          e.preventDefault();
          e.stopPropagation();
          items = [
            {
              text: t_("Edit"),
              click: edit_contact(contact)
            }, {
              text: t_("Delete"),
              click: delete_contact(contact)
            }
          ];
          coords = $(this).offset();
          coords.left += $(this).innerWidth();
          return show_contextmenu(items, coords);
        });
      }
    });
    $(".js-attach-contact").on("click", function(e) {
      var button, container, dialog;
      e.preventDefault();
      button = $(this).hide();
      container = button.data("container");
      dialog = $("<div class='sg-inline-dialog'/>").appendTo(".js-contacts-form[data-container=" + container + "]").hide().on("submit", "form", function(e) {
        e.preventDefault();
        return $.post($(this).attr("action"), $(this).serialize(), function(data) {
          return dialog.slideUp(function() {
            $(data).prependTo(".js-contacts[data-container=" + container + "]").hide().effect("highlight", {}, 1000);
            dialog.remove();
            return button.show();
          });
        });
      }).on("click", ".js-new-contact", function(e) {
        e.preventDefault();
        return dialog.slideUp(function() {
          dialog.remove();
          return button.show();
        });
      });
      return $.get($(this).attr("href"), function(data) {
        dialog.append(data).slideDown();
        dialog.find(".chzn-select").chosen();
        return dialog.find("button").button();
      });
    });
    return $(".js-contacts[data-container]").sortable({
      handle: ".js-drag-handle",
      items: ".ui-contact",
      update: function(e, ui) {
        return $.post("/a/contacts/" + (ui.item.data('id')) + "/sort", {
          occupation_id: ui.item.data("occupation_id"),
          number: $(this).children(".ui-contact").length - 1 - $(this).children(".ui-contact").index(ui.item)
        });
      }
    });
  }))();

  if ($.fn.alphabet) $(".js-filter-form").alphabet(".ui-contact", ".js-name");

  filterItems = $(".ui-contact").filterItems();

  filterForm = $(".js-filter-form").observe(0.5, function() {
    var b, field, fields_matched, results, search, search_tokens, token, tokens_matched, _i, _j, _k, _len, _len2, _len3, _ref;
    search = this.find("[name='search']").val().toLowerCase();
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
    }
    if (search) {
      this.find(".js-filter-results").removeClass("load").text("Найдено: " + results);
    } else {
      this.find(".js-filter-results").removeClass("load").text("");
    }
    this.find(".js-alphabet").empty();
    return this.alphabet(".ui-contact", ".js-name");
  }, function() {
    return this.find(".js-filter-results").addClass("load").text("Идёт поиск");
  });

  filterForm.submit(function(e) {
    return e.preventDefault();
  });

}).call(this);
