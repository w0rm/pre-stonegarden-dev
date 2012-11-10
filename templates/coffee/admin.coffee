define ["jquery", "utils", "config", "jquery-notify"], ($, utils) ->

  window.t_ = (s) -> if (i18n? and i18n[s]) then i18n[s] else s

  window.build_contextmenu = (items) ->
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

  $ ->

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


  $.extend $.ui.dialog.prototype.options,
    modal: true,
    close: -> $(this).remove()

  #
  # Errors and debug
  #

  $growl = null

  window.growl = (template, vars, opts) ->
    vars.title = "" unless vars.title?
    $growl ?= $("#notify").notify()
    $growl.notify "create", "notify-#{template}", vars, opts

  window.debug = ->
    $("body").toggleClass "debug"

  $ ->
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

  config.folder = "/a/documents" # saves current open folder in storage


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

  $ ->
    $(document).restrict()

  #
  #  Creates a function that decorates js function
  #  fn = restrict("manager","admin") -> alert("ff")
  #  fn()
  window.restrict = (role...) -> (method) -> ->
    method.apply(@, arguments) if config.role in role

