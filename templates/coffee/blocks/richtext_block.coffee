define ["./html_block", "jquery-tinymce"], (HTMLBlock) ->

  class RichtextBlock extends HTMLBlock

    # The same as html block but with tinymce

    form_init: -> @find("textarea[name=content]").tinymce config.tinymce
