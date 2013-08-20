$def with(conf)
define(function() {

  var conf = $:conf;

  conf.config.tinymce = {
    script_url: "/static/vendor/js/tiny_mce/tiny_mce.js",
    content_css: "/static/css/tinymce.css",
    external_link_list_url: "/a/tinymce_link_list.js",
    theme: "advanced",
    mode: "none",
    language: document.documentElement.lang,
    auto_resize: true,
    object_resizing: false,
    width: "100%",
    relative_urls: false,
    plugins: "table,contextmenu,paste,visualchars,inlinepopups,autoresize,autosave",
    cleanup_on_startup: true,
    paste_create_paragraphs: true,
    paste_create_linebreaks: true,
    paste_use_dialog: false,
    paste_auto_cleanup_on_paste: true,
    paste_convert_middot_lists: false,
    paste_convert_headers_to_strong: false,
    paste_remove_spans: true,
    paste_remove_styles: true,
    theme_advanced_buttons1: "visualchars,undo,pastetext,save,formatselect,styleselect,bold,italic,sub,sup,charmap,|,bullist,numlist,|,link,unlink,anchor,table,hr,|,removeformat,code",
    theme_advanced_layout_manager: "SimpleLayout",
    theme_advanced_toolbar_location: "external",
    theme_advanced_path: false,
    theme_advanced_statusbar_location: "none",
    theme_advanced_resizing: false,
    save_enablewhendirty: true,
    valid_elements: conf.config.tinymce_valid_elements,
    style_formats : [
        {title : "$_('Label')", inline : "span", classes : "label radius"},
        {title : "$_('Subheader')", inline : "span", classes : "subheader"},
        {title : "$_('Small')", inline : "span", classes : "small"},
        {title : "$_('Exposed')", inline : "span", classes : "exposed"}
    ],
    setup: function(ed) {
      return ed.onInit.add(function(ed) {
        return ed.focus();
      });
    }
  };

  return conf;

});
