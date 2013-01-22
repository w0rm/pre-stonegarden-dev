require.config({
  urlArgs: window.environment === "development" ? 'bust=' + (new Date).getTime() : "",
  paths: {
    stonegarden: '/a/config',
    jquery: '../vendor/js/jquery-1.8.1',
    'jquery.foundation.reveal': '../vendor/js/foundation/jquery.foundation.reveal',
    'jquery.foundation.orbit': '../vendor/js/foundation/jquery.foundation.orbit',
    'jquery.foundation.topbar': '../vendor/js/foundation/jquery.foundation.topbar',
    'jquery.tinymce': '../vendor/js/tiny_mce/jquery.tinymce',
    'ace': '../vendor/js/ace',
    backbone: '../vendor/js/backbone-0.9.2',
    underscore: '../vendor/js/underscore-1.4.2'
  },
  shim: {
    'jquery.tinymce': ['jquery'],
    'jquery.foundation.reveal': ['jquery'],
    'jquery.foundation.orbit': ['jquery'],
    'jquery.foundation.topbar': ['jquery'],
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


require(["jquery"
       , "plugins/jquery.responsive"
       , "plugins/jquery.splash"
       , "jquery.foundation.orbit"], function($) {

  $(function() {
    $(".responsive").responsiveImage()

    $(".js-splash").splash()

    $(".js-gallery").each(function(){
      var $gallery = $(this)
        , hasThumbs = $gallery.find("[data-thumb]").length > 0;

      if (hasThumbs) {
        $gallery.orbit({bullets: true, bulletThumbs: true});
      } else {
        $gallery.orbit({bullets: true});
      }

    });

    var svg = !!('createElementNS' in document &&
      document.createElementNS('http://www.w3.org/2000/svg','svg').createSVGRect)

    if (!svg) document.body.className += ' no-svg'

  });
});
