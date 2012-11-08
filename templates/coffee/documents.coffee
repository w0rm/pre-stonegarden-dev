#
#  Documents
#
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


class FolderDocument extends BasicDocument

  context_items: ->
    $.merge [
      text: t_("Copy link") + "…"
      click: =>
        dialog = $("<div/>").attr("title", t_("Copy link")).append($("<p/>").append($("<input/>").attr(
          type: "text"
          value:  "#{window.location.protocol}//#{window.location.host}/a/documents/#{@data("id")}"
        ).css(width: 250).click(-> $(this).select()))).appendTo("body").dialog(
          buttons: [
            text: t_("Close")
            click: -> dialog.dialog "close"
          ]
        )
        dialog.find("input").focus().select()

    ], super()


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

documents =
  folder: new FolderDocument
  document: new DocumentDocument
  image: new ImageDocument

$.fn.call_doc = (f, args...) ->
  documents[@data("filetype")][f].apply this, args

#
#  Documents section
#
$.fn.documents = ->

  is_uploading = false
  root_id = (@data "root_id") ? 1

  navigate = (document_id) =>
    $.get "/a/documents/#{document_id}", (data) =>
      contextmenu_button.detach()
      $container = $(data)
      $documents = $container.find(".ui-documents")

      unless root_id is document_id
        $documents.prepend """
        <li class="ui-document folder is_parent" data-filetype="folder" data-id="#{$container.data("document_id")}">
            <div class="ui-document-container folder"></div>
            <p class="ui-document-title">...</p>
        </li>
        """

      @find(".js-documents-container").empty().append( $documents )
      @data("id", document_id)
      @find(".js-documents-breadcrumbs").replaceWith $(data).find(".js-documents-breadcrumbs")
      (restrict("admin","editor") =>
        $documents.sortable
          handle: ".js-drag-handle"
          items: "li:not(.folder)"
          update: (e, ui) ->
            $.post "/a/documents/#{ui.item.data("id")}/order",
              position: $(this).children("li:not(.folder)").index(ui.item) + 1
      )()

  @on "navigate", (e, document_id) => navigate(document_id)

  @on "click", ".js-documents-breadcrumbs a, .ui-document.folder", (e) ->
    e.preventDefault()
    navigate $(this).data("id")

  @on "click", ".js-documents-tile", (e) =>
    e.preventDefault()
    @find(".js-documents-tile").addClass "active"
    @find(".js-documents-list").removeClass "active"
    @removeClass "ui-documents-list"

  @on "click", ".js-documents-list", (e) =>
    e.preventDefault()
    @find(".js-documents-list").addClass "active"
    @find(".js-documents-tile").removeClass "active"
    @addClass "ui-documents-list"

  @on "mouseenter", ".ui-document", (e) ->
    e.stopPropagation()
    unless contextmenu_button.parent().is(this) or $(this).is(".is_parent.folder")
      doc = $(this)
      contextmenu_button.prependTo doc
      contextmenu_button.off "click"
      contextmenu_button.on "click", (e) ->
        e.preventDefault()
        e.stopPropagation()
        items = doc.call_doc "context_items"
        coords = contextmenu_button.offset()
        coords.left += $(this).innerWidth()
        show_contextmenu items, coords

  @on "contextmenu", ".ui-document", (e) ->
    unless $(this).is(".is_parent.folder")
      e.preventDefault()
      items = $(this).call_doc "context_items"
      show_contextmenu items,
        left: e.pageX - 2
        top: e.pageY - 2

  @on "click", ".image.ui-document", (e) ->
    e.preventDefault()
    $(this).call_doc("preview_size", size: "m", settings: config.image["m"])()


  (restrict("admin","editor") =>

    @on "click", ".js-documents-newfolder", (e) =>
      e.preventDefault()
      title = prompt t_("New folder"), t_("New folder")
      if title
        $.post "/a/documents/newfolder",
          title: title
          document_id: @data("id")
        , (data) =>
          root_folder = @find(".ui-documents .is_parent.folder")
          if root_folder.length > 0
            $(data.html).insertAfter(root_folder).effect("highlight", {}, 1000)
          else
            $(data.html).prependTo(@find(".ui-documents")).effect("highlight", {}, 1000)

    upload = (files) =>
      unless FormData?
        alert "Your browser does not support standard HTML5 Drag and Drop"
        return
      xhr = new XMLHttpRequest()
      status = $("<span/>")
      new_document = $("<li />").addClass("ui-document-dropping").append($("<p/>").text(t_("Uploading")), status).appendTo(@find(".ui-documents"))
      xhr_upload = xhr.upload
      form = new FormData()
      xhr_upload.addEventListener "progress", ((e) ->
        if e.lengthComputable
          status.text (if e.loaded is e.total then t_("Processing") else Math.round(e.loaded * 100 / e.total) + "%")
      ), false
      xhr_upload.addEventListener "load", ((e) -> ), false
      xhr_upload.addEventListener "error", ((error) ->
        status.text "#{t_("Error")}: #{error}"
      ), false
      xhr.open "POST", "/a/documents/upload"
      xhr.setRequestHeader "X-Requested-With", "XMLHttpRequest"
      xhr.onreadystatechange = (e) =>
        if xhr.readyState is 4
          is_uploading = false
          if xhr.status is 200
            data = $.parseJSON(e.target.responseText)
            if data.status is 0
              status.text t_("File upload error!")
              new_document.fadeOut -> $(this).remove()
            else
              navigate @data("id")
          else
            status.text t_("File upload error!")
            new_document.fadeOut -> $(this).remove()
      form.append "document_id", @data("id")
      for f in files
        form.append "files", f
      is_uploading = true
      xhr.send form

    @on
      dragover: (e) =>
        dt = e.originalEvent.dataTransfer
        return true if not dt? or not dt.files? or dt.items[0].kind isnt "file" or is_uploading
        dt.dropEffect = "copy"
        @addClass "active"
        false
      dragleave: (e) => @removeClass "active"
      dragenter: (e) -> false
      drop: (e) =>
        dt = e.originalEvent.dataTransfer
        @removeClass "active"
        return true unless dt? and dt.files?
        upload dt.files
        false
  )()
  navigate @data "id"


$(".js-documents").documents()
