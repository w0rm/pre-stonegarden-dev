define [
  "jquery",
  "documents/folder_document",
  "documents/document_document",
  "documents/image_document",
  "admin"
], (
  $,
  FolderDocument,
  DocumentDocument,
  ImageDocument
) ->

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

    unless this.length
      return this

    is_uploading = false
    root_id = (@data "root_id") ? 1

    navigate = (document_id) =>
      $.get "/a/documents/#{document_id}", (data) =>
        contextmenu_button.detach()
        $container = $(data)
        $documents = $container.find(".ui-documents")

        unless root_id is document_id
          $documents.prepend """
          <li class="ui-document folder is_parent"
              data-filetype="folder"
              data-id="#{$container.data("document_id")}">
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
