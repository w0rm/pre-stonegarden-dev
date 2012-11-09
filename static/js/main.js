require.config({
  paths: {
    "jquery": "vendor/jquery-1.8.1",
    "jquery-ui": "vendor/jquery-ui-1.8.23.custom",
    "jquery-notify": "vendor/jquery.notify-1.5",
    "config": "/a/config",
    "tinymce": "vendor/tiny_mce/jquery.tinymce"
  }
});
// pages
// users
require(["jquery", "jquery-ui", "jquery-notify", "tinymce", "config"], function($) {
  $(function() {
    require(["admin"], function(){
      require(["blocks", "documents"]);
    })
  });
});
