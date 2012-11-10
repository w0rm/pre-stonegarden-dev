
define ["jquery"], ($) ->

  class BasicDocument

    # Binds to the .ui-document li
    edit_properties: ->
      $.get "/a/documents/#{@data("id")}.json", (data) =>
        contextmenu_button.detach()
        dialog = $("<div/>").attr("title", t_("Properties"))
        .append(@find(".ui-document-container").clone().css(float: "left"), $("<div>").css(
          overflow: "hidden"
          padding: "0 20px"
        ).append($("<p/>").append($("<label/>").text(t_("Title") + " ").append("<br>", $("<input type=\"text\" name=\"title\" />").val(data.title))), $("<p/>").append($("<label/>").text(t_("Description") + " ").append($("<textarea type=\"text\" name=\"content\" />").val(data.content))), $("<p/>").append($("<label/>").text(t_("Show on site")).prepend((if data.is_published is 1 then $("<input type=\"checkbox\" name=\"is_published\" checked=\"checked\" />") else $("<input type=\"checkbox\" name=\"is_published\" />")))))).appendTo("body")
        .dialog
          width: 500
          buttons: [
            text: t_("Apply")
            click: =>
              $.post "/a/documents/#{@data("id")}/edit_settings",
                title: $.trim(dialog.find("input[name=title]").val())
                is_published: dialog.find("input[name=is_published]").attr("checked") or `undefined`
                content: $.trim(dialog.find("textarea[name=content]").val())
              , (data) =>
                contextmenu_button.detach()
                @replaceWith data.html
              dialog.dialog "close"
          ,
            text: t_("Cancel")
            click: -> dialog.dialog "close"
          ]

    # Binds to the .ui-document li
    delete_document: ->
      $.post "/a/documents/#{@data("id")}/delete", =>
        contextmenu_button.detach()
        growl "default", {text: "Удаление прошло успешно"}, {expires: 3000}
        @remove()

    # Binds to the .ui-document li
    context_items: ->

      items = []

      (restrict("admin","editor") =>

        unless @hasClass "is_system"

          items.push
            text: t_("Properties") + "…"
            click: => @call_doc "edit_properties"

          items.push
            text: t_("Delete")
            click: =>
              dialog = $("<div/>").attr("title", t_("Delete this document?"))
              .append($("<p/>").text(t_("Deleting folder will also delete all nested documents."))).appendTo("body")
              .dialog(
                modal: true
                close: (ev, ui) -> dialog.remove()
                buttons: [
                  text: t_("Delete")
                  click: =>
                    @call_doc "delete_document"
                    dialog.dialog "close"
                ,
                  text: t_("Cancel")
                  click: -> dialog.dialog "close"
                ]
              )
      )()

      items

