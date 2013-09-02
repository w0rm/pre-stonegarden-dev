require.config({
  urlArgs: window.environment === "development" ? 'bust=' + (new Date).getTime() : "",
  paths: {
    jquery: '../vendor/js/jquery-1.8.1',
    'jquery.foundation.orbit': '../vendor/js/foundation/foundation.orbit',
    'jquery.foundation': '../vendor/js/foundation/foundation'
  },
  shim: {
    'jquery.foundation': ['jquery'],
    'jquery.foundation.orbit': ['jquery.foundation']
  }
});

require(["jquery"
       , "plugins/jquery.responsive"
       , "plugins/jquery.gallery"], function($) {

  $(function() {

    $(".responsive").responsiveImage()
    $(".js-gallery").gallery()

    var svg = !!('createElementNS' in document &&
      document.createElementNS('http://www.w3.org/2000/svg','svg').createSVGRect)

    if (!svg) document.body.className += ' no-svg'

  });
});
