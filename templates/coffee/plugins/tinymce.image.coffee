window.openStorage = (ed, url) ->
  dialog = $("<div/>")
  node = ed.selection.getNode()
  dialog_wgt = `undefined`
  dialog_title = `undefined`
  dialog_form = `undefined`
  img_src = `undefined`
  img_alt = `undefined`
  img_class = `undefined`

  insert_image_size = (doc, k) -> (e) ->
    $.get "/a/documents/#{doc.data("id")}/image_size",
      size: k
    , (data) ->
      img_src.val data.src
      img_alt.val data.title
      dialog_wgt.find(".ui-button").trigger "click" if e.altKey

  doc_items = (doc) ->
    sizes = (size: k, settings: v for k, v of config.image).sort (a, b) ->
      a1 = a.settings[0] or 999999999
      b1 = b.settings[0] or 999999999
      return 1 if a1 > b1
      return -1 if a1 < b1
      return 0

    [
      text: t_("Insert image")
      click: insert_image_size(doc, "m")
    ,
      separator: true
    ,
      text: t_("Sizes") + " →"
      items: ((
        text: t_(config.labels[s.size]) + (if s.settings[0] then " [#{s.settings[0]}]" else "") + "…"
        click: insert_image_size(doc, s.size)
      ) for s in sizes)
    ]

  $.get config.folder,
    filter: true
  , (data) ->
    dialog.append($(data).find(".ui-documents")).appendTo("body").dialog
      width: 600
      height: 500
      modal: true
      close: (ev, ui) ->
        contextmenu_button.detach()
        dialog.remove()
        $("body").trigger "click"
      buttons: [
        text: t_("Insert")
        click: ->
          unless img_src.val()
            ed.dom.remove node if node.nodeName is "IMG"
          else
            args =
              src: img_src.val()
              alt: img_alt.val()
              class: img_class.val()

            if node and node.nodeName is "IMG"
              ed.dom.setAttribs node, args
            else
              ed.execCommand "mceInsertContent", false, "<img id=\"__mce_tmp\" />",
                skip_undo: 1

              ed.dom.setAttribs "__mce_tmp", args
              ed.dom.setAttrib "__mce_tmp", "id", ""
              ed.undoManager.add()
          $(this).dialog "close"
          ed.execCommand "mceRepaint"
          ed.focus()
      ]

    dialog_wgt = dialog.dialog("widget")
    dialog_title = dialog_wgt.find(".ui-dialog-title").append($(data).find(".js-documents-breadcrumbs"))
    dialog_form = dialog_wgt.find(".ui-dialog-buttonpane").addClass("ui-gradient").append("<div class=\"small-padding-block\" style=\"overflow:hidden\">            \t    <p><label for=\"img_src\">" + t_("URL") + "</label><input id=\"img_src\" name=\"img_src\" class=\"fullwidth\" type=\"text\"/></p>            \t    <p style=\"white-space:nowrap;\"><label for=\"img_alt\">" + t_("Hint") + "</label><input id=\"img_alt\" name=\"img_alt\" type=\"text\" size=\"15\"/>             \t    <label class=\"before\" style=\"margin-left:10px;\" for=\"img_class\">" + t_("Class") + "</label><input id=\"img_class\" name=\"img_class\" type=\"text\" size=\"15\"/></p>            \t    </div>")
    img_src = dialog_wgt.find("input[name=img_src]")
    img_alt = dialog_wgt.find("input[name=img_alt]")
    img_class = dialog_wgt.find("input[name=img_class]")

    if node and node.nodeName is "IMG"
      img_src.val $(node).attr("src")
      img_alt.val $(node).attr("alt")
      img_class.val $(node).attr("class")

    dialog_wgt.on "click", ".js-documents-breadcrumbs a, .ui-document.folder", (e) ->
      e.preventDefault()
      link = $(this)
      config.folder = "/a/documents/" + link.data("id")
      $.get config.folder,
        filter: true
      , (data) ->
        contextmenu_button.detach()
        dialog.html $(data).find(".ui-documents")
        dialog_title.html $(data).find(".js-documents-breadcrumbs")

    dialog.on "mouseenter", ".ui-document.image", (e) ->
      e.stopPropagation() # don't propagate this event to the parent blocks
      unless contextmenu_button.parent().is(this)
        doc = $(this)
        contextmenu_button.prependTo this
        contextmenu_button.off "click"
        contextmenu_button.on "click", (e) ->
          e.preventDefault()
          e.stopPropagation()
          items = doc_items(doc)
          coords = contextmenu_button.offset()
          coords.left += $(this).innerWidth()
          show_contextmenu items, coords
