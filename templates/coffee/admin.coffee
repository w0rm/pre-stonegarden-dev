
timify = (time) -> 
  if time < 10
    "0" + time
  else
    time

window.t_ = (s) -> if (i18n? and i18n[s]) then i18n[s] else s

build_contextmenu = (items) ->
  contextmenu = $("<ul class=\"ui-contextmenu\"/>")
  $.each items, ->
    li = $("<li/>").appendTo(contextmenu)
    if @separator
      li.addClass "ui-contextmenu-separator"
    else
      li.addClass "ui-contextmenu-item"
      if @items and @items.length
        li.append $("<span/>").text(@text), build_contextmenu(@items)
      else
        if @click?
          li.append $("<a href=\"#\"/>").text(@text).click(((item) ->
            (e) ->
              e.preventDefault()
              item.click e
              $(".ui-contextmenu-root").removeClass "ui-contextmenu-item"
              setTimeout (-> $(".ui-contextmenu-root").remove()), 1000
              contextmenu_button.detach()
          )(this))
        else
          link = $("<a/>").text(@text).attr("href", @href)
          if @target
            link.attr("target", @target)
          li.append link
  contextmenu

window.show_contextmenu = (items, position) ->
  $(".ui-contextmenu-root").remove()
  $("body").one "click", (e) -> $(".ui-contextmenu-root").remove()
  contextmenu = $("<div/>").click((e) ->
    e.stopPropagation()
  ).append(build_contextmenu(items)).css(
    left: position.left
    top: position.top
    height: 20
  ).appendTo("body")

  setTimeout (->
    contextmenu.addClass "ui-contextmenu-item ui-contextmenu-root active"
    contextmenu.trigger "mouseenter"
  ), 0

window.contextmenu_button = $("""<div class="ui-show-contextmenu"><span class="ui-icon ui-icon-edzo-menu"></span></div>""")
#$(".ui-show-contextmenu").live "mouseover mousemove dblclick", (e) -> e.stopPropagation()

$(document).on "mouseenter", ".ui-contextmenu-item, .ui-insert-menu-item", (e) ->
  ui = $(this)
  submenu = ui.children(".ui-contextmenu")
  left = ui.offset().left + ui.width()
  top = ui.offset().top + ui.height()
  if submenu.length > 0
    if $(window).width() + $(window).scrollLeft() - left < submenu.width() + 5
      ui.addClass "ui-contextmenu-left"
    else
      ui.removeClass "ui-contextmenu-left"
    if $(window).height() + $(window).scrollTop() - top < submenu.height() + 5
      ui.addClass "ui-contextmenu-top"
    else
      ui.removeClass "ui-contextmenu-top"

$("button").button()

#
#  Input date
#

dateFromString = (dateAsString) ->
  pattern = new RegExp "(\\d{4})-(\\d{2})-(\\d{2}) (\\d{2}):(\\d{2}):(\\d{2})"
  parts = dateAsString.match pattern
  if parts
    new Date(
      parseInt(parts[1], 10),
      parseInt(parts[2], 10) - 1,
      parseInt(parts[3], 10),
      parseInt(parts[4], 10),
      parseInt(parts[5], 10),
      parseInt(parts[6], 10),
      0
    )
  else
    null

$.extend $.ui.dialog.prototype.options,
  modal: true,
  close: -> $(this).remove()


$.datepicker.regional["ru"] =
  closeText: "Закрыть"
  prevText: "&#x3c;Пред"
  nextText: "След&#x3e;"
  currentText: "Сегодня"
  monthNames: [ "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь" ]
  monthNamesShort: [ "января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря" ]
  dayNames: [ "Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота" ]
  dayNamesShort: [ "вск", "пнд", "втр", "срд", "чтв", "птн", "сбт" ]
  dayNamesMin: [ "Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб" ]
  weekHeader: "Не"
  dateFormat: "yy.mm.dd"
  firstDay: 1
  isRTL: false
  showMonthAfterYear: false
  yearSuffix: ""

$.datepicker.setDefaults $.datepicker.regional[$("body").data("lang")]

$.fn.dateInput = ->
  this.each ->
    name = $(this).attr("name")
    value = $(this).val()
    altField = $("""<input type="text" readonly />""")
      .attr("size", $(this).attr("size"))
      .click(-> dateinput.datepicker "show")
    dateinput = $("<input />").attr(
      type: "hidden"
      name: name
    ).val(value).datepicker(
      altField: altField
      altFormat: "d M, yy"
    )
    $(this).before(dateinput).replaceWith altField
    dateinput.datepicker "setDate", dateFromString(value)

$.fn.datetimeInput = ->
  this.each ->
    name = $(this).attr("name")
    value = $(this).val()

    altField = $("""<input type="text" readonly />""")
      .attr("size", $(this).attr("size"))
      .click(-> dateinput.datepicker "show")

    dateinput = $("<input />").attr(
      type: "hidden"
      name: name
    ).val(value).datepicker(
      altField: altField
      altFormat: "d M, yy"
      onSelect: (year, month, inst) ->
        changevalue()
    ).replaceAll(this)

    changevalue = (e) ->
      hours = parseInt(hoursinput.val())
      minutes = parseInt(minutesinput.val())
      hours = 0 unless hours
      minutes = 0 unless minutes
      hours = 0 if hours < 0 
      hours = 23 if hours > 23
      minutes = 0 if minutes < 0
      minutes = 59 if minutes > 59    
      datestring = $.datepicker.formatDate('yy-mm-dd', dateinput.datepicker("getDate"));
      dateinput.val datestring + " "+ timify(hours)  + ":" + timify(minutes) + ":00"
      hoursinput.val timify(hours)
      minutesinput.val timify(minutes)
      true

    hoursinput = $( """<input size="2" maxlength="2" class="sg-datetime-hours" type="text" />""" ).change(changevalue)
    minutesinput = $( """<input size="2" maxlength="2" class="sg-datetime-minutes" type="text" />""" ).change(changevalue)

    dateinput.after(
      $("""<span class="sg-datetime" />""").append(
        altField,
        hoursinput,
        $("<span>:</span>"),
        minutesinput
      )
    )

    if value
      date = dateFromString( value )
      hoursinput.val date.getHours()
      minutesinput.val date.getMinutes()
      dateinput.datepicker "setDate", date


$("input.date").dateInput()
$("input.datetime").datetimeInput()


#
#  Address input with map
#

if $(".js-address-map").length and ymaps?
  ymaps.ready ->
    mapCenter = [ 58.521917, 31.274631 ]
    zoom = 14
    if $("#longitude").val() isnt "" and parseFloat($("#longitude").val()) isnt 0
      mapCenter = [ $("#latitude").val(), $("#longitude").val() ]
    map = new ymaps.Map($(".js-address-map").get(0),
      center: mapCenter
      zoom: zoom
    )
    map.controls.add "smallZoomControl", left: 10, top: 10
    placemark = new ymaps.Placemark(mapCenter, {},
      draggable: true
      hasBalloon: false
      hideIcon: true
      preset: "twirl#blueStretchyIcon"
    )
    map.geoObjects.add placemark
    map.events.add "click", (e) ->
      placemark.geometry.setCoordinates e.get("coordPosition")

    placemark.events.add "geometrychange", (e) ->
      [lat, long] = placemark.geometry.getCoordinates()
      $("#longitude").val long
      $("#latitude").val lat

    $(".js-address-locate").click (e) ->
      e.preventDefault()
      address = "Великий Новгород, " + $("#address_street").val()
      dom = $("#address_dom").val()
      korpus = $("#address_korpus").val()
      stroenie = $("#address_stroenie").val()
      address += ", д. " + dom if dom
      address += ", к. " + korpus if korpus
      address += ", стр. " + stroenie if stroenie
      geocoder = ymaps.geocode(address,
        boundedBy: map.getBounds()
        strictBounds: false
        results: 1
      )
      geocoder.then (res) ->
        if res.geoObjects.getLength()
          point = res.geoObjects.get(0)
          map.panTo point.geometry.getCoordinates()
          placemark.geometry.setCoordinates point.geometry.getCoordinates()
        else
          alert "Ничего не найдено!"

      false


#
# Errors and debug
#

$growl = $("#notify").notify()

window.growl = (template, vars, opts) ->
  vars.title = "" unless vars.title?
  $growl.notify "create", "notify-#{template}", vars, opts

window.debug = ->
  $("body").toggleClass "debug"

$(".flash").each ->
  flash = $(this).detach()
  growl flash.data("template"),
    title: flash.attr("title")
    text: flash.html()
  ,
    expires: (if flash.data("template") is "default" then 3000 else false)

window.onerror = (errorMsg, url, lineNumber) ->
  growl "error",
    title: t_("Error")
    text: "#{errorMsg} in #{url}, line #{lineNumber}"
  ,
    expires: false

$.ajaxSetup error: (jqXHR, textStatus, errorThrown) ->
  if jqXHR.status isnt 412
    if jqXHR.getResponseHeader("content-type") is "application/json"
      data = $.parseJSON(jqXHR.responseText)
      if data.redirect?
        window.location.replace data.redirect
    else
      growl "error",
        title: errorThrown ? t_("Error")
        text: (if jqXHR.status is 0 then t_("Network error.") else jqXHR.responseText)
      ,
        expires: false

# prevent drop on document
$(document).on
  dragenter: (e) -> false
  dragleave: (e) -> false
  dragover: (e) ->
    dt = e.originalEvent.dataTransfer
    return unless dt
    dt.dropEffect = "none"
    false

config.tinymce =
  script_url: "/static/js/vendor/tiny_mce/tiny_mce.js"
  content_css: "/static/css/tinymce.css"
  theme: "advanced"
  mode: "none"
  language : $("body").data("lang")
  auto_resize: true
  object_resizing : false
  width: "100%"
  relative_urls: false
  plugins: "table,edzo,contextmenu,paste,fullscreen,visualchars,nonbreaking,inlinepopups,autoresize,save,autosave"
  cleanup_on_startup: true
  paste_create_paragraphs: true
  paste_create_linebreaks: true
  paste_use_dialog: false
  paste_auto_cleanup_on_paste: true
  paste_convert_middot_lists: false
  paste_convert_headers_to_strong: false
  paste_remove_spans: true
  paste_remove_styles: true
  theme_advanced_buttons1: "example,visualchars,undo,pastetext,save,formatselect,styleselect,bold,italic,blockquote,|,bullist,numlist,|,link,unlink,anchor,image,charmap,hr,|,removeformat,code"
  theme_advanced_layout_manager: "SimpleLayout"
  theme_advanced_toolbar_location: "external"
  theme_advanced_path: false
  theme_advanced_statusbar_location: "none"
  theme_advanced_resizing: false
  save_enablewhendirty: true
  valid_elements: config.tinymce_valid_elements
  setup: (ed) -> ed.onInit.add (ed) -> ed.focus()

config.notes_tinymce = $.extend {}, config.tinymce,
  content_css: "/static/css/notes_tinymce.css"
  plugins: "table,edzo,contextmenu,paste,fullscreen,visualchars,nonbreaking,inlinepopups,save,autosave"
  auto_resize: false
  height: 350
  theme_advanced_buttons1: "undo,pastetext,save,bold,italic,|,bullist,numlist,|,link,unlink,anchor,image,|,removeformat,code"
  theme_advanced_toolbar_location: "top"
  valid_elements: config.notes_tinymce_valid_elements

config.folder = "/a/documents" # saves current open folder in storage

# TINYMCE PLUGINS 
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
        #link_title.val( $( this ).text() );
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

#
#  Watches form for changes
#
$.fn.observe = (time, callback, startCallback) -> @each ->
  form = $(this)
  timer = false
  form.on "change keyup search", ":input", ->
    if not $(this).is("[type=text],[type=search]") or $(this).val() isnt $(this).data("old_value")
      startCallback?.call form
      clearTimeout timer
      timer = setTimeout(->
        callback.call form
      , time * 1000)
      $(this).data "old_value", $(this).val()

#
#  Remove all elements with no rights
#
$.fn.restrict = -> @find("[data-role]").each ->
  $(this).remove() unless config.role in $(this).data("role").split(",")

$(document).restrict()  


#
#  Creates a function that decorates js function
#  fn = restrict("manager","admin") -> alert("ff")
#  fn()
window.restrict = (role...) -> (method) -> ->
  method.apply(@, arguments) if config.role in role


(restrict("admin", "editor") ->

  $(document).on "click", ".js-remove-image", (e) ->
    e.preventDefault()
    $imageDrop = $(this).closest(".js-image-drop")
    $imageDrop.find("img").attr("src", $imageDrop.data("empty_src"))
    $imageDrop.find("input[name=photo_id]").val("")
    $(this).addClass("hide")
    
  $(document).on
    dragover: (e) ->
      dt = e.originalEvent.dataTransfer
      return true unless dt? and dt.files? and dt.items[0].kind is "file" and not $(this).data("isUploading")?
      dt.dropEffect = "copy"
      $(this).addClass "active"
      false
    dragleave: (e) -> $(this).removeClass "active"
    dragenter: (e) -> false
    drop: (e) ->
      el = $(this)
      dt = e.originalEvent.dataTransfer
      el.removeClass "active"
      return true unless dt? and dt.files?
      unless FormData?
        alert "Your browser does not support standard HTML5 Drag and Drop"
        return
      xhr = new XMLHttpRequest()
      status = $("<span/>").appendTo(el)
      el.closest("form").find("[type=submit]").attr("disabled", true)
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
          el.removeData("isUploading")
          el.closest("form").find("[type=submit]").removeAttr("disabled")
          if xhr.status is 200
            data = $.parseJSON(e.target.responseText)
            if data.status is 0
              status.text t_("File upload error!")
            status.fadeOut -> $(this).remove()
            el.find("img").attr("src", data.src)
            el.find("input[name=photo_id]").val(data.id)
            el.find(".js-remove-image").removeClass("hide")
            $(".js-documents[data-id=#{$(this).data("document_id")}]")
              .trigger "navigate", [$(this).data("document_id")]
          else
            status.text t_("File upload error!")
            status.fadeOut -> $(this).remove()
      form.append "document_id", $(this).data("document_id")
      form.append "upload", "image"
      form.append "filename", $(this).data("filename")
      form.append "files", dt.files[0]
      $(this).data("isUploading", true)
      xhr.send form
      false
  ,
    ".js-image-drop"
  
)()

# Search cache
$.fn.filterItems = ->
  
  normalizeSearch = (idx, el) ->
    if $(el).hasClass("js-search-phone")
      $(el).text().replace(/\D/g, '')
    else
      $(el).text().toLowerCase()
  
  @map( (idx, el) ->
    element: $(el)
    search_fields: $(el).find(".js-search-field, .js-search-phone").map(normalizeSearch).get()
    visible: true
  ).get()


$.fn.alphabet = (el, title) ->
  letter = ""
  $alphabet = @find(".js-alphabet")
  $(el).each (idx, item) =>
    next_letter = $(item).find(title).text()[0]
    if next_letter and next_letter isnt letter
      $alphabet.append("<li><a href=##{item.id}>#{next_letter}</a></li>")
      letter = next_letter
  @on "click", "a", (e) ->
    e.preventDefault()
    $(window).scrollTop $( $(this).attr("href")).offset().top - 70

  $("body").scrollspy? offset: 130
  @affix? offset: 80
