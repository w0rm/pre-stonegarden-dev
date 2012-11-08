(function() {
  var delete_note, edit_note;

  $(".js-create-note").on("click", function(e) {
    var button, dialog;
    e.preventDefault();
    button = $(this).hide();
    dialog = $("<div class='sg-inline-dialog'/>").appendTo(".js-notes-form").hide().on("submit", "form", function(e) {
      e.preventDefault();
      return $.post("/a/notes/new", $(this).serialize()).done(function(data) {
        return dialog.slideUp(function() {
          $(data).hide().prependTo(".js-notes").effect("highlight", {}, 1000);
          dialog.remove();
          return button.show();
        });
      }).fail(function(jqXHR) {
        dialog.html(jqXHR.responseText);
        dialog.find("button").button();
        return dialog.find("textarea[name=details]").tinymce(config.notes_tinymce);
      });
    }).on("click", ".js-cancel", function(e) {
      e.preventDefault();
      return dialog.slideUp(function() {
        dialog.remove();
        return button.show();
      });
    });
    return $.get($(this).attr("href"), function(data) {
      dialog.append(data).slideDown();
      dialog.find("button").button();
      dialog.find("textarea[name=details]").tinymce(config.notes_tinymce);
      return dialog.find("input.datetime").datetimeInput();
    });
  });

  edit_note = function(note) {
    return function(e) {
      return $.get("/a/notes/" + (note.data("id")) + "/edit", function(data) {
        var dialog;
        dialog = $("<div title='Редактирование заметки'>");
        dialog.append(data).appendTo("body").on("submit", "form", function(e) {
          e.preventDefault();
          return $.post("/a/notes/" + (note.data("id")) + "/edit", dialog.find("form").serialize()).done(function(data) {
            contextmenu_button.detach();
            note.replaceWith(data);
            return dialog.dialog("close");
          }).fail(function(jqXHR) {
            dialog.html(jqXHR.responseText);
            dialog.find("button").button();
            return dialog.find("textarea").tinymce(config.notes_tinymce);
          });
        }).on("click", ".js-cancel", function(e) {
          e.preventDefault();
          return dialog.dialog("close");
        }).dialog({
          width: 700,
          height: 520
        });
        dialog.find("button").button();
        dialog.find("textarea").tinymce(config.notes_tinymce);
        return dialog.find("input.datetime").datetimeInput();
      });
    };
  };

  delete_note = function(note) {
    return function(e) {
      var dialog;
      dialog = $("<div/>").attr("title", "Удаление заметки");
      return dialog.append($("<p/>").text("Вы действительно хотите удалить заметку?")).appendTo("body").dialog({
        modal: true,
        close: function(ev, ui) {
          return $(this).remove();
        },
        buttons: [
          {
            text: t_("Delete"),
            click: function() {
              return $.post("/a/notes/" + (note.data("id")) + "/delete", function(data) {
                contextmenu_button.detach();
                note.remove();
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

  $(document).on("mouseenter", ".ui-note", function(e) {
    var note;
    e.stopPropagation();
    if (!contextmenu_button.parent().is(this)) {
      note = $(this);
      contextmenu_button.prependTo(this);
      contextmenu_button.off("click");
      return contextmenu_button.on("click", function(e) {
        var coords, items;
        e.preventDefault();
        e.stopPropagation();
        items = [
          {
            text: t_("Edit"),
            click: edit_note(note)
          }, {
            text: t_("Delete"),
            click: delete_note(note)
          }
        ];
        coords = $(this).offset();
        coords.left += $(this).innerWidth();
        return show_contextmenu(items, coords);
      });
    }
  });

}).call(this);
