require.config({
  urlArgs: window.environment === "development" ? 'bust=' + (new Date).getTime() : "",
  paths: {
    jquery: '../vendor/js/jquery-1.8.1',
    'jquery.foundation.orbit': '../vendor/js/foundation/jquery.foundation.orbit',
    ymaps: "http://api-maps.yandex.ru/2.0/?load=package.full&lang=ru-RU"
  },
  shim: {
    'jquery.foundation.orbit': ['jquery'],
    ymaps: {
      exports: "ymaps"
    }
  }
});

require(["jquery"
       , "plugins/jquery.responsive"
       , "plugins/jquery.splash"
       , "plugins/jquery.gallery"
       , "plugins/jquery.legacy"
       , "plugins/jquery.lightbox"
       , "plugins/jquery.notaries_map"], function($) {

  $(function() {

    $(".responsive").responsiveImage()
    $(".js-splash").splash()
    $(".js-gallery").gallery()
    $(".js-legacy").legacy()
    $(".js-notaries-map").notariesMap()

    var svg = !!('createElementNS' in document &&
      document.createElementNS('http://www.w3.org/2000/svg','svg').createSVGRect)

    if (!svg) document.body.className += ' no-svg'

  });
});
