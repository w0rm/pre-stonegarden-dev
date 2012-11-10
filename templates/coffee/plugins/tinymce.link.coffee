window.openLink = (ed, url) ->
  dialog = $("<div title='#{t_("Hyperlink")}'/>")
  dialog_wgt = undefined
  dialog_title = undefined
  link_href = undefined
  link_title = undefined
  link_class = undefined
  link_text = undefined
  open_sitemap = undefined
  node = ed.selection.getNode()
  text_input = false
  dialog.html("""
  <div class="small-padding-block">
    <p class="link_text">
      <label for="link_text">#{t_("Text")}</label>
      <input id="link_text" name="link_text" type="text" class="fullwidth">
    </p>
    <p>
      <label for="link_href">#{t_("Link")}</label>
      <a class="ui-icon-button open_sitemap" style="float:right"><span class="ui-icon ui-icon-edzo-sitemap"></span></a>
      <span style="display: block; overflow:hidden; position:relative">
        <input id="link_href" name="link_href" type="text" class="fullwidth">
      </span>
    </p>
    <p><label for="link_title">#{t_("Hint")}</label><input id="link_title" name="link_title" type="text"></p>
    <p><label for="link_class">#{t_("Class")}</label><input id="link_class" name="link_class" type="text"></p>
  </div>""")
  .appendTo("body")
  .dialog
    width: 400
    modal: true
    close: (ev, ui) ->
      $(this).remove()
      $("body").trigger "click"
    buttons: [
      text: t_("Create")
      click: ->
        args =
          title: link_title.val()
          href: link_href.val()
          class: link_class.val()

        unless args.href
          i = ed.selection.getBookmark()
          ed.dom.remove node, 1
          ed.selection.moveToBookmark i
        else

          # Create new anchor elements
          unless node?
            ed.getDoc().execCommand "unlink", false, null

            #tinyMCEPopup
            ed.execCommand "mceInsertLink", false, "#mce_temp_url#",
              skip_undo: 1

            $(ed.dom.doc).find("a[href='#mce_temp_url#']").each ->
              ed.dom.setAttribs this, args
              $(this).html link_text.val()  if text_input
              node = this

            ed.undoManager.add()
          else
            ed.dom.setAttribs node, args
            $(node).html link_text.val()  if text_input

          # Don't move caret if selection was image
          if node.childNodes.length isnt 1 or node.firstChild.nodeName isnt "IMG"
            ed.focus()
            ed.selection.select node
            ed.selection.collapse 0

        #tinyMCEPopup.storeSelection();
        ed.focus()
        $(this).dialog "close"
    ]

  dialog_wgt = dialog.dialog("widget")
  dialog_title = dialog_wgt.find(".ui-dialog-title").addClass("small-padding-block")
  link_href = dialog.find("input[name=link_href]")
  link_title = dialog.find("input[name=link_title]")
  link_class = dialog.find("input[name=link_class]")
  link_text = dialog.find("input[name=link_text]")
  open_sitemap = dialog.find("a.open_sitemap").click((e) ->
    e.preventDefault()
    $.get "/a/sitemap", (data) ->
      dialog = $("<div/>").attr("title", t_("Site map")).append($(data).find(".sitemap")).appendTo("body").dialog(
        modal: true
        close: (ev, ui) ->
          $(this).remove()
          $("body").trigger "click"

        buttons: [
          text: t_("Cancel")
          click: ->
            $(this).dialog "close"
        ]
      )
      dialog.find("a.page-link").click (e) ->
        e.preventDefault()
        link_href.val "/to/" + $(this).data("id")
        dialog.dialog "close"
  )
  node = ed.dom.getParent(node, "A")
  if node? and node.nodeName is "A"
    link_href.val $(node).attr("href")
    link_title.val $(node).attr("title")
    link_text.val $(node).text()
    link_class.val $(node).attr("class")
    if $(node).children().length > 0
      dialog.find(".link_text").remove()
    else
      text_input = true
  else
    dialog.find(".link_text").remove()
