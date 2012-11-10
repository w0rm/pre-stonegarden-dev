define ["jquery", "./block"], ($, Block) ->


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
        $.ajax
          url: "/a/blocks/#{@data("id")}"
          type: "PUT"
          data:
            container: container.data("container")
            content: content
            page_id: page_id
          success: (data) =>
            @replaceWith data
      else
        @find("button[name=cancel]").trigger "click"

    context_items: ->
      $.merge [
        text: t_("Edit")
        click: => @call_block "edit_block"
      ], super()

    form_init: -> @find("textarea[name=content]").focus()
