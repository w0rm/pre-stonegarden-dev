$def with(conf)
define(function() {

  var conf = $:conf;

  conf.config.tinymce = {
    script_url: "/static/vendor/js/tiny_mce/tiny_mce.js",
    content_css: "/static/css/tinymce.css",
    theme: "advanced",
    mode: "none",
    language: document.documentElement.lang,
    auto_resize: true,
    object_resizing: false,
    width: "100%",
    relative_urls: false,
    plugins: "table,edzo,contextmenu,paste,fullscreen,visualchars,nonbreaking,inlinepopups,autoresize,save,autosave",
    cleanup_on_startup: true,
    paste_create_paragraphs: true,
    paste_create_linebreaks: true,
    paste_use_dialog: false,
    paste_auto_cleanup_on_paste: true,
    paste_convert_middot_lists: false,
    paste_convert_headers_to_strong: false,
    paste_remove_spans: true,
    paste_remove_styles: true,
    theme_advanced_buttons1: "example,visualchars,undo,pastetext,save,formatselect,styleselect,bold,italic,blockquote,|,bullist,numlist,|,link,unlink,anchor,image,charmap,hr,|,removeformat,code",
    theme_advanced_layout_manager: "SimpleLayout",
    theme_advanced_toolbar_location: "external",
    theme_advanced_path: false,
    theme_advanced_statusbar_location: "none",
    theme_advanced_resizing: false,
    save_enablewhendirty: true,
    valid_elements: conf.config.tinymce_valid_elements,
    setup: function(ed) {
      return ed.onInit.add(function(ed) {
        return ed.focus();
      });
    }
  };

  return conf;

});
