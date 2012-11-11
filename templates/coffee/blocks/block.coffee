define ["jquery", "admin"], ($) ->

  class Block

    # Binds to ui that has created this block,
    # inserter = element, after which we append the new element
    new_block: (inserter) ->
      container = inserter.parent(".container")
      $.post "/a/blocks",
        block_id: inserter.closest(".block").data("id")
        page_id: page_id
        container: container.data("container")
        template: @data("template")
        is_template: container.hasClass("is_template") or `undefined`
        position: inserter.siblings(".block").index(inserter.prev(".block")) + 2
      , (response) ->
        container.children(".placeholder").remove()
        inserter.after response.html

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
      , (response) =>
        contextmenu_button.detach()
        insert.detach()
        @replaceWith response.html

    # Binds to the .block div that columns have to be unwrapped
    unwrap_block: ->
      $.post "/a/blocks/#{@data("id")}/unwrap",
        page_id: page_id
      , (html) =>
        contextmenu_button.detach()
        insert.detach()
        @parent(".container").html html

    # Binds to the .block div that has to be wrapped
    wrap_block: (template) ->
      $.post "/a/blocks/#{@data("id")}/wrap",
        template: template
        page_id: page_id
      , (response) =>
        insert.detach()
        contextmenu_button.detach()
        @replaceWith response.html

    # Binds to ui that has triggered paste of this block, inserter is element after which block is pasted
    paste_block: (inserter) ->
      container = inserter.closest(".container")
      $.post "/a/blocks/paste",
        block_id: inserter.closest(".block").data("id")
        page_id: page_id
        container: container.data("container")
        is_template: container.hasClass("is_template") or `undefined`
        position: inserter.siblings(".block").index(inserter.prev(".block")) + 2
      , (response) =>
        inserter.next(".placeholder").remove() # remove placeholder
        inserter.after response.html # paste data
        # @remove() keep paste trigger

    # Binds to the .block div that has to be copied
    copy_block: (duplicate) ->
      $.post "/a/blocks/#{@data("id")}/copy",
        page_id: page_id
      , (response) =>
        if insert.find(".js-paste-block").length is 0
          insert.children(".ui-insert-menu").prepend """
          <a class="ui-insert-default
                    js-paste-block" href="#">#{t_("Paste")}
          """

    # Binds to the .block div that has to be cut
    cut_block: (duplicate) ->
      $.post "/a/blocks/#{@data("id")}/cut",
        page_id: page_id
      , (response) =>
        # TODO: this is common with delete_block ajax callback
        container = @parent(".container")
        contextmenu_button.detach()
        @remove()
        if container.children().not(".ui-insert").length is 0
          container.append placeholderHTML
        # END TODO
        if insert.find(".js-paste-block").length is 0
          insert.children(".ui-insert-menu").prepend $("<a class=\"ui-insert-default js-paste-block\" href=\"#\"/>").text(t_("Paste"))

    # Binds to the .block div that has to be deleted
    delete_block: ->
      $.ajax
        url: "/a/blocks/#{@data("id")}",
        type: "DELETE",
        success: (response) =>
          container = @parent(".container")
          contextmenu_button.detach()
          @remove()
          if container.children().not(".ui-insert").length is 0
            container.append placeholderHTML

    # Binds to the .block div that parent's columns have to be changed
    edit_columns: ->
      container = @parent ".container"
      parent_block = container.closest(".block")

      options = $("<div/>")
      dialog = $("<div/>").attr("title", t_("Columns"))
      container_allows_columns = container.hasClass "has_columns"

      in_columns = parent_block.data("template")?.substr(0, 4) is "cols"

      options.append $("<p/>").append(
        $("<label class=\"after\"/>").append(
          (if container_allows_columns and not in_columns then $("<input type=\"radio\" name=\"template\" checked=\"checked\" />") else $("<input type=\"radio\" name=\"template\"/>")),
          $("<span class=\"ui-icon ui-icon-edzo-t-cols_100\"/>").css(
            display: "inline-block"
            "vertical-align": "text-bottom"
          ),
          document.createTextNode(t_("No columns"))
        )
      )

      $.each config.container_blocks, (k, v) ->
        input = $("<input type=\"radio\" name=\"template\"/>").data("template", v)
        input.attr "checked", true  if in_columns and parent_block.data("template") is v
        options.append $("<p/>").append($("<label class=\"after\"/>").append(input, $("<span class=\"ui-icon\"/>").addClass("ui-icon-edzo-t-" + v).css(
          display: "inline-block"
          "vertical-align": "text-bottom"
        ), document.createTextNode(t_(config.labels[v]))))

      dialog.append(options).appendTo("body").dialog
        buttons: [
          text: t_("Apply")
          click: =>
            new_template = options.find("input:checked").data("template")
            if in_columns
              # Change parent block
              if new_template
                parent_block.call_block "update_template", new_template
              else
                parent_block.call_block "unwrap_block"
            else if container_allows_columns
              # Wrap in newly created columns block
              if new_template
                @call_block "wrap_block", new_template
            dialog.dialog "close"
        ,
          text: t_("Cancel")
          click: => dialog.dialog "close"
        ]

    # Binds to the .block div that columns have to be changed
    edit_properties: ->
      container = @parent(".container")
      dialog = $("<div/>").attr("title", t_("Properties"))
      $.get "/a/blocks/#{@data("id")}", (data) =>
        block = data.block
        dialog_html =
          """
          <div class="small-padding-block">
            <p>
              <label>
                #{t_("CSS class")}
              </label>
              <input type="text" name="css_class" class="fullwidth"
                     value="#{block.css_class || ""}" >
            </p>
            <p>
              <label class="after">
                <input type="checkbox" name="is_published"
                       #{if block.is_published is 1 then "checked" else ""} >
                #{t_("Show on site")}
              </label>
            </p>
          </div>
          """
        dialog.html(dialog_html).appendTo("body").dialog(
          buttons: [
            text: t_("Apply")
            click: =>
              css_class = $.trim(dialog.find("[name=css_class]").val())
              is_published = dialog.find("[name=is_published]").attr("checked") or `undefined`
              $.post "/a/blocks/#{@data("id")}/edit_settings",
                css_class: css_class
                is_published: is_published
                page_id: page_id
              , (response) =>
                @replaceWith response.html

              dialog.dialog "close"
          ,
            text: t_("Cancel")
            click: -> dialog.dialog "close"
          ]
        ).dialog("widget").find(".ui-dialog-title").addClass "small-padding-block"

    # Block context menu items binds to the .block div that has to be deleted
    context_items: ->
      container = @parent(".container")
      parent_block = container.closest(".block")
      items = []

      if container.hasClass("has_columns") or parent_block.length > 0 and parent_block.data("template").substr(0, 4) is "cols"
        items.push
          text: t_("Columns") + "…"
          click: -> block.call_block "edit_columns"
        items.push separator: true

      items.push
        text: t_("Properties") + "…"
        click: -> block.call_block "edit_properties"

      if parent_block.length > 0 and parent_block.data("template").substr(0, 4) is "cols"
        items.push
          text: t_("Container properties") + "…"
          click: -> parent_block.call_block "edit_properties"

      items.push separator: true

      items.push
        text: t_("Cut")
        click: => @call_block "cut_block"

      items.push
        text: t_("Copy")
        click: => @call_block "copy_block"

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
