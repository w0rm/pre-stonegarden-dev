define ["jquery", "./block"], ($, Block) ->


  class HTMLBlock extends Block


    new_block: (inserter) ->

      container = inserter.parent(".container")

      new_block = $ """
        <div class="fixed-block"
             data-template="#{@data("template")}"
             class="#{@data("template")}">
          <textarea name="content" rows="10"></textarea>
          <div class="ui-block-edit">
            <button class="js-ok">#{t_("OK")}</button>
            <button class="js-cancel">#{t_("Cancel")}</button>
          </div>
        </div
        """

      new_block.insertAfter inserter
      inserter.detach()

      new_block.find(".js-ok").click (e) =>
        $(e.target).attr("disabled", "disabled")
        new_block.call_block "create_block"

      new_block.find(".js-cancel").click (e) =>
        new_block.remove()
        if container.children(".block").length is 0
          container.append placeholderHTML

      new_block.call_block "form_init"
      container.children(".placeholder").remove()


    create_block: ->
      content = $.trim(@find("textarea[name=content]").val())
      container = @parent(".container")
      if content
        $.post "/a/blocks",
          block_id: @closest(".block").data("id")
          page_id: page_id
          container: container.data("container")
          template: @data("template")
          is_template: container.hasClass("is_template") or `undefined`
          position: @siblings(".block").index(@prev(".block")) + 2
          content: content
        , (response) =>
          @replaceWith response.html
      else
        @find(".js-cancel").trigger "click"


    edit_block: ->

      $.get "/a/blocks/#{@data("id")}", (response) =>

        insert.detach()
        contextmenu_button.detach()

        block = response.block
        @html """
          <textarea name="content" rows="10">
            #{block.content}
          </textarea>
          <div class="ui-block-edit">
            <button class="js-ok">#{t_("OK")}</button>
            <button class="js-cancel">#{t_("Cancel")}</button>
          </div>
          """
        @removeClass("block")
        @addClass("fixed-block")
        @call_block("form_init")

        @find(".js-ok").click (e) =>
          $(e.target).attr("disabled", "disabled")
          @call_block "update_block"

        @find(".js-cancel").click (e) =>
          @html """
            <div class="content">
              #{block.content_cached}
            </div>
            """
          @removeClass("fixed-block")
          @addClass("block")


    update_block: ->
      content = $.trim(@find("[name=content]").val())
      container = @closest(".container")
      if content
        $.ajax
          url: "/a/blocks/#{@data("id")}"
          type: "PUT"
          data:
            container: container.data("container")
            content: content
            page_id: page_id
          success: (response) =>
            @replaceWith response.html
      else
        @find(".js-cancel").trigger "click"


    context_items: ->
      $.merge [
        text: t_("Edit")
        click: => @call_block "edit_block"
      ], super()


    form_init: ->
      @find("[name=content]").focus()
