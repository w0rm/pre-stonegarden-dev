define ["jquery", "./basic_document"], ($, BasicDocument) ->

  class DocumentDocument extends BasicDocument

    context_items: ->
      $.merge [
        text: t_("Copy link") + "…"
        click: =>
          dialog = $("<div/>").attr("title", t_("Copy download link")).append($("<p/>").append($("<input/>").attr(
            type: "text"
            value:  "#{window.location.protocol}//#{window.location.host}/uploads/#{@data("filename")}"
          ).css(width: 250).click(-> $(this).select()))).appendTo("body").dialog(
            buttons: [
              text: t_("Close")
              click: -> dialog.dialog "close"
            ]
          )
          dialog.find("input").focus().select()
      ,
        text: t_("Download")
        click: => window.location.replace "/uploads/#{@data("filename")}"
      ,
        separator: true
      ], super()
