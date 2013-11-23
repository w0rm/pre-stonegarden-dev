$def with(conf)
define(function() {

  var conf = $:conf;

  conf.config.tinymce = {
    content_css: "/static/css/tinymce.css",
    mode: "none",
    language: document.documentElement.lang,
    auto_resize: true,
    object_resizing: false,
    width: "100%",
    relative_urls: false,
    menubar: false,
    statusbar: false,
    plugins: "anchor autoresize charmap contextmenu image link paste media code",
    
    toolbar: "pastetext | styleselect | blockquote | link | removeformat  ",
    contextmenu: "link anchor image | bold italic strikethrough | charmap code",

    schema: "html5",
    // valid_elements: conf.config.tinymce_valid_elements,
    link_list: "/a/tinymce_link_list.js",
   
      style_formats: [
        {title: 'Headers', items: [
            {title: 'h1', block: 'h1'},
            {title: 'h2', block: 'h2'},
            {title: 'h3', block: 'h3'},
            {title: 'h4', block: 'h4'},
            {title: 'h5', block: 'h5'},
            {title: 'h6', block: 'h6'}
        ]},
        {title: 'Blocks', items: [
            {title: 'p', block: 'p'},
            {title: 'blockquote', block: 'blockquote', wrapper: true},
            {title: 'div', block: 'div'},
        ]},
        {title: 'Styles', items: [
            {title : "$_('Label')", inline : "span", classes : "label radius"},
            {title : "$_('Subheader')", selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li', classes : "subheader"},
            {title : "$_('Small')", selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li',classes : "small"},
             {title : "$_('Exposed')", selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li', classes : "exposed"}
        ]},
        {title: 'Text align', items: [
            {title: 'Left', selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div', classes : "text-left"},
            {title: 'Center', selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div',classes : "text-center"},
            {title: 'Right', selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div', classes : "text-right"}
        ]}
    ],
  
    setup: function(editor) {
      editor.on('init', function(a,b,c){
        this.focus();
      });
      
    }
    // , file_browser_callback: function(field_name, url, type, win) { 
    //     win.document.getElementById(field_name).value = 'my browser value'; 
    // }
  };

  return conf;

});
