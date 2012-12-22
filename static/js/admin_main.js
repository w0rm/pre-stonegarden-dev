require.config({
  urlArgs: window.environment === "development" ? 'bust=' + (new Date).getTime() : "",
  paths: {
    stonegarden: '/a/config',
    jquery: '../vendor/js/jquery-1.8.1',
    'jquery.foundation.reveal': '../vendor/js/jquery.foundation.reveal-1.1',
    'jquery.tinymce': '../vendor/js/tiny_mce/jquery.tinymce',
    backbone: '../vendor/js/backbone-0.9.2',
    underscore: '../vendor/js/underscore-1.4.2'
  },
  shim: {
    'jquery.tinymce': ['jquery'],
    'jquery.foundation.reveal': ['jquery'],
    underscore: {
      exports: '_'
    },
    backbone: {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    }
  }
});

require(["blocks", "documents"]);

require(["jquery", "plugins/jquery.responsive"], function($) {
  $(function() {
    $(".responsive").responsiveImage()
  });
});

