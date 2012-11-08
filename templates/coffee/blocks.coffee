#
#  Blocks
# 730 -> 360 (486 compiled)

class Block

  # Binds to ui that has created this block,
  # inserter = element, after which we append the new element
  new_block: (inserter) ->
    container = inserter.parent(".container")
    $.post "/a/blocks/new",
      block_id: inserter.closest(".block").data("id")
      page_id: page_id
      container: container.data("container")
      template: @data("template")
      is_template: container.hasClass("is_template") or `undefined`
      position: inserter.siblings(".block").index(inserter.prev(".block")) + 2
    , (data) ->
      container.children(".placeholder").remove()
      inserter.after data

  # Binds to the .fixed-block div that has edit controls in it
  create_block: ->

  # Binds to the .block div that needs edit
  edit_block: ->

  # Binds to the .fixed-block div that has edit controls in it
  update_block: ->

  # Binds to the .block div that columns have to be changed
  update_template: (template) ->
    $.post "/a/blocks/#{@data("id")}/edit_template",
      template: template
      page_id: page_id
    , (data) =>
      contextmenu_button.detach()
      insert.detach()
      @parent(".container").html data

  # Binds to the .block div that columns have to be unwrapped
  unwrap_block: ->
    $.post "/a/blocks/#{@data("id")}/unwrap",
      page_id: page_id
    , (data) =>
      contextmenu_button.detach()
      insert.detach()
      @parent(".container").html data

  # Binds to the .block div that has to be wrapped
  wrap_block: (template) ->
    $.post "/a/blocks/#{@data("id")}/wrap",
      template: template
      page_id: page_id
    , (data) =>
      insert.detach()
      contextmenu_button.detach()
      @replaceWith data

  # Binds to ui that has triggered paste of this block, inserter is element after which block is pasted
  paste_block: (inserter) ->
    container = inserter.closest(".container")
    $.post "/a/blocks/paste",
      block_id: inserter.closest(".block").data("id")
      page_id: page_id
      container: container.data("container")
      is_template: container.hasClass("is_template") or `undefined`
      position: inserter.siblings(".block").index(inserter.prev(".block")) + 2
    , (data) =>
      inserter.next(".placeholder").remove() # remove placeholder
      inserter.after data # paste data
      @remove() # remove paste trigger
      $(".block.is_cut").each ->
        # remove cutted block
        container = $(this).parent(".container")
        $(this).remove()
        container.append placeholderHTML if container.children().not(".ui-insert").length is 0

  # Binds to the .block div that has to be moved/copied
  move_block: (duplicate) ->
    $.post "/a/blocks/#{@data("id")}/move",
      duplicate: duplicate
      page_id: page_id
    , (data) =>
      contextmenu_button.detach()
      @replaceWith data
      @addClass "is_cut" unless duplicate
      if insert.find(".js-paste-block").length is 0
        insert.children(".ui-insert-menu").prepend $("<a class=\"ui-insert-default js-paste-block\" href=\"#\"/>").text(t_("Paste"))

  # Binds to the .block div that has to be deleted
  delete_block: ->
    $.post "/a/blocks/#{@data("id")}/delete", (data) =>
      container = @parent(".container")
      contextmenu_button.detach()
      @remove()
      container.append placeholderHTML if container.children().not(".ui-insert").length is 0

  # Binds to the .block div that columns have to be changed
  edit_columns: ->
    block = this
    container = block.parent(".container")
    options = $("<div/>")
    dialog = $("<div/>").attr("title", t_("Columns"))
    has_columns = container.hasClass("has_columns")
    in_columns = not has_columns and container.closest(".block").length > 0 and container.closest(".block").data("template").substr(0, 4) is "cols"
    options.append $("<p/>").append($("<label class=\"after\"/>").append((if has_columns and not in_columns then $("<input type=\"radio\" name=\"template\" checked=\"checked\" />") else $("<input type=\"radio\" name=\"template\"/>")), $("<span class=\"ui-icon ui-icon-edzo-t-cols_100\"/>").css(
      display: "inline-block"
      "vertical-align": "text-bottom"
    ), document.createTextNode(t_("No columns"))))
    $.each config.container_blocks, (k, v) ->
      input = $("<input type=\"radio\" name=\"template\"/>").data("template", v)
      input.attr "checked", true  if in_columns and container.closest(".block").data("template") is v
      options.append $("<p/>").append($("<label class=\"after\"/>").append(input, $("<span class=\"ui-icon\"/>").addClass("ui-icon-edzo-t-" + v).css(
        display: "inline-block"
        "vertical-align": "text-bottom"
      ), document.createTextNode(t_(config.labels[v]))))

    dialog.append(options).appendTo("body").dialog
      buttons: [
        text: t_("Apply")
        click: ->
          new_template = options.find("input:checked").data("template")
          if has_columns
            # We create columns
            block.call_block "wrap_block", new_template  if new_template
          else if in_columns
            if new_template
              container.closest(".block").call_block "update_template", new_template
            else
              container.closest(".block").call_block "unwrap_block"
          $(this).dialog "close"
      ,
        text: t_("Cancel")
        click: ->
          $(this).dialog "close"
      ]

  # Binds to the .block div that columns have to be changed
  edit_properties: ->
    block = this
    container = block.parent(".container")
    dialog = $("<div/>").attr("title", t_("Properties"))
    $.get "/a/blocks/" + block.data("id") + ".json", (data) ->
      dialog.append($("<div class=\"small-padding-block\">").append($("<p/>").append($("<label for=\"css_class\" />").text(t_("CSS class") + " "), $("<input id=\"css_class\" type=\"text\" name=\"css_class\" class=\"fullwidth\" />").val(data.css_class)), $("<p/>").append($("<label class=\"after\"/>").text(t_("Show on site")).prepend((if data.is_published is 1 then $("<input type=\"checkbox\" name=\"is_published\" checked=\"checked\" />") else $("<input type=\"checkbox\" name=\"is_published\" />")))))).appendTo("body").dialog(
        buttons: [
          text: t_("Apply")
          click: ->
            css_class = $.trim(dialog.find("input[name=css_class]").val())
            is_published = dialog.find("input[name=is_published]").attr("checked") or `undefined`
            $.post "/a/blocks/" + block.data("id") + "/edit_settings",
              css_class: css_class
              is_published: is_published
              page_id: page_id
            , (data) ->
              block.replaceWith data

            $(this).dialog "close"
        ,
          text: t_("Cancel")
          click: ->
            $(this).dialog "close"
        ]
      ).dialog("widget").find(".ui-dialog-title").addClass "small-padding-block"

  # Block context menu items binds to the .block div that has to be deleted
  context_items: ->
    block = this
    container = block.parent(".container")
    items = []

    if container.hasClass("has_columns") or container.closest(".block").length > 0 and container.closest(".block").data("template").substr(0, 4) is "cols"
      items.push
        text: t_("Columns") + "…"
        click: -> block.call_block "edit_columns"
      items.push separator: true

    items.push
      text: t_("Properties") + "…"
      click: -> block.call_block "edit_properties"

    if container.closest(".block").length > 0 and container.closest(".block").data("template").substr(0, 4) is "cols"
      items.push
        text: t_("Container properties") + "…"
        click: -> container.closest(".block").call_block "edit_properties"

    items.push separator: true
    items.push
      text: t_("Copy")
      click: -> block.call_block "move_block", true

    items.push
      text: t_("Cut")
      click: -> block.call_block "move_block"

    items.push separator: true
    items.push
      text: t_("Delete")
      click: ->
        dialog = $("<div/>").attr("title", t_("Delete this block?")).append($("<p/>").text(t_("It will also delete all the nested blocks."))).appendTo("body").dialog(
          buttons: [
            text: t_("Delete")
            click: ->
              block.call_block "delete_block"
              $(this).dialog "close"
          ,
            text: t_("Cancel")
            click: ->
              $(this).dialog "close"
          ]
        )

    items


class HTMLBlock extends Block

  new_block: (inserter) ->
    new_block = $("<div class=\"fixed-block\"/>").data("template", @data("template")).addClass(@data("template"))
    container = inserter.parent(".container")
    new_block.append($("<textarea name=\"content\" rows=\"10\"/>"), $("<div class=\"ui-block-edit\"/>").append($("<button/>").button(label: t_("OK")).click(->
      $(this).button "disable"
      new_block.call_block "create_block"
    ), $("<button name=\"cancel\"/>").button(label: t_("Cancel")).click(->
      new_block.remove()
      container.append placeholderHTML if container.children(".block").length is 0
    ))).insertAfter(inserter).call_block "form_init"
    container.children(".placeholder").remove()
    inserter.detach()

  create_block: ->
    content = $.trim(@find("textarea[name=content]").val())
    container = @parent(".container")
    if content
      $.post "/a/blocks/new",
        block_id: @closest(".block").data("id")
        page_id: page_id
        container: container.data("container")
        template: @data("template")
        is_template: container.hasClass("is_template") or `undefined`
        position: @siblings(".block").index(@prev(".block")) + 2
        content: content
      , (data) =>
        @replaceWith data
    else
      @find("button[name=cancel]").trigger "click"

  edit_block: ->
    block = this
    $.get "/a/blocks/#{@data("id")}.json", (data) ->
      insert.detach()
      contextmenu_button.detach()
      block.empty().append($("<textarea name=\"content\" rows=\"10\"/>").val(data.content), $("<div class=\"ui-block-edit\"/>").append($("<button/>").button(label: t_("OK")).click(->
        $(this).button "disable"
        block.call_block "update_block"
      ), $("<button name=\"cancel\"/>").button(label: t_("Cancel")).click(->
        block.html("<div class=\"content\">" + data.content_cached + "</div>").removeClass("fixed-block").addClass "block"
      ))).removeClass("block").addClass("fixed-block").call_block "form_init"

  update_block: ->
    content = $.trim(@find("textarea[name=content]").val())
    container = @closest(".container")
    if content
      $.post "/a/blocks/#{@data("id")}/edit",
        container: container.data("container")
        content: content
        page_id: page_id
      , (data) =>
        @replaceWith data
    else
      @find("button[name=cancel]").trigger "click"

  context_items: ->
    $.merge [
      text: t_("Edit")
      click: => @call_block "edit_block"
    ], super()

  form_init: -> @find("textarea[name=content]").focus()



class RichtextBlock extends HTMLBlock

  # The same as html block but with tinymce

  form_init: -> @find("textarea[name=content]").tinymce config.tinymce


blocks =
  default: new Block
  htmlcode: new HTMLBlock
  richtext: new RichtextBlock


$.fn.call_block = (f, args...) ->
  (blocks[@data("template")] ? blocks["default"])[f].apply this, args

placeholderHTML =
  """
  <div class="placeholder" data-template="richtext">
    <p>
      #{t_("This text is not written yet.")}
      <strong>#{t_("Click to write the text.")}</strong>
      <br>
      #{t_("Do not worry, such placeholder texts are not visible on the public website until you edit them.")}
    </p>
  </div>
  """

page_id = $("body").data("id")

insert = $(".ui-insert").on("mousemove", (e) ->
  e.stopPropagation()
  contextmenu_button.detach()
).detach()

$(document).on "click", ".js-insert-block, .placeholder", (e) ->
  e.preventDefault()
  $(this).call_block "new_block", insert

$(document).on "click", ".js-paste-block", (e) ->
  e.preventDefault()
  $(this).call_block "paste_block", insert

$(document).on "mousemove", ".placeholder", (e) ->
  e.stopPropagation()
  unless insert.next().is this
    insert.insertBefore this

$(document).on
  mouseenter: (e) ->
    e.stopPropagation()
    if not contextmenu_button.parent().is(this) and $(this).find(".container").length is 0
      # show context menu only on blocks that don't have containers
      contextmenu_button.prependTo(this).off("click").on "click", (e) ->
        e.preventDefault()
        e.stopPropagation()
        block = $(this).parent()
        template = block.data("template")
        items = block.call_block("context_items")
        coords = contextmenu_button.offset()
        coords.left += $(this).innerWidth()
        show_contextmenu items, coords
  mousemove: (e) ->
    e.stopPropagation()
    top = (e.pageY - $(this).offset().top) < $(this).height() / 2
    el = $(this)[(if top then "prev" else "next")]()
    insert[(if top then "insertBefore" else "insertAfter")] this  if el.length is 0 or (not el.hasClass("fixed-block") and not el.hasClass("ui-insert"))
  dblclick: (e) ->
    e.stopPropagation() # don't propagate this event to the parent blocks
    $(this).call_block "edit_block"
,
  ".block"
