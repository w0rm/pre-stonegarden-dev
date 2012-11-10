require.config
  urlArgs: "bust=" + (new Date).getTime()
  paths:
    jquery: "../vendor/js/jquery-1.8.1"
    "jquery-ui": "../vendor/js/jquery-ui-1.8.23.custom"
    "jquery-notify": "../vendor/js/jquery.notify-1.5"
    config: "/a/config"
    "jquery-tinymce": "../vendor/js/tiny_mce/jquery.tinymce"
  shim:
    'jquery-ui': ['jquery'],
    'jquery-notify': ['jquery-ui'],
    'jquery-tinymce': ['jquery', "plugins/tinymce.image", "plugins/tinymce.link"]


require ["blocks", "documents"]


