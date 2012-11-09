require.config paths:
  jquery: "../vendor/js/jquery-1.8.1"
  "jquery-ui": "../vendor/js/jquery-ui-1.8.23.custom"
  "jquery-notify": "../vendor/js/jquery.notify-1.5"
  config: "/a/config"
  tinymce: "../vendor/js/tiny_mce/jquery.tinymce"

# pages
# users
require ["jquery", "jquery-ui", "jquery-notify", "tinymce", "config"], ($) ->
  $ ->
    require ["admin"], ->
      require ["blocks", "documents"]
