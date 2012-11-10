define ["jquery", "./basic_document"], ($, BasicDocument) ->

  class ImageDocument extends BasicDocument

    preview_size: (s) -> =>

      $.get "/a/documents/#{@data("id")}/image_size", size: s.size, (data) =>
        dialog = $("<div/>").attr("title", t_("Image preview")).append($("<img/>").attr("src", data.src)).appendTo("body").dialog(
          width: 730
          height: 750
          buttons: [
            text: t_("Close")
            click: -> dialog.dialog "close"
          ]
        )

    context_items: ->

      sizes = (size: k, settings: v for k, v of config.image).sort (a, b) ->
        a1 = a.settings[0] or 999999999
        b1 = b.settings[0] or 999999999
        return 1 if a1 > b1
        return -1 if a1 < b1
        return 0

      sizes_items = ((
        text: t_(config.labels[s.size]) + (if s.settings[0] then " [#{s.settings[0]}]" else "") + "…"
        href: "/a/documents/#{@data("id")}/image_size?" + $.param(size: s.size)
        target: "_blank"
      ) for s in sizes)

      $.merge [
        text: t_("Preview") + "…"
        click: @call_doc("preview_size", size: "m", settings: config.image["m"])
      ,
        text: t_("Preview sizes") + " →"
        items: sizes_items
      ,
        separator: true
      ], super()
