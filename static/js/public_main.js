require.config({
  urlArgs: window.environment === "development" ? 'bust=' + (new Date).getTime() : "",
  paths: {
    stonegarden: '/a/config',
    jquery: '../vendor/js/jquery-1.8.1',
    'jquery.foundation.orbit': '../vendor/js/foundation/jquery.foundation.orbit',
  },
  shim: {
    'jquery.foundation.orbit': ['jquery']
  }
});

require(["jquery"
       , "plugins/jquery.responsive"
       , "plugins/jquery.splash"
       , "plugins/jquery.gallery"], function($) {

  $(function() {

    $(".responsive").responsiveImage()
    $(".js-splash").splash()
    $(".js-gallery").gallery()

    var svg = !!('createElementNS' in document &&
      document.createElementNS('http://www.w3.org/2000/svg','svg').createSVGRect)

    if (!svg) document.body.className += ' no-svg'

  });
});
