define ["jquery", "blocks/block",
        "blocks/html_block",
        "blocks/richtext_block",
        "admin"], ($, Block, HTMLBlock, RichtextBlock) ->

  $ ->

    blocks =
      default: new Block
      htmlcode: new HTMLBlock
      richtext: new RichtextBlock

    $.fn.call_block = (f, args...) ->
      (blocks[@data("template")] ? blocks["default"])[f].apply this, args

    window.placeholderHTML =
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

    window.page_id = $("body").data("id")

    window.insert = $(".ui-insert").on("mousemove", (e) ->
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
