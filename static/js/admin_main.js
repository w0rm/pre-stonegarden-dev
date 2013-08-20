require.config({
  urlArgs: window.environment === "development" ? 'bust=' + (new Date).getTime() : "",
  paths: {
    stonegarden: '/a/config',
    jquery: '../vendor/js/jquery-1.8.1',
    'jquery.ui': '../vendor/js/jquery-ui-1.10.1.custom',
    'jquery.foundation.reveal': '../vendor/js/foundation/jquery.foundation.reveal',
    'jquery.foundation.orbit': '../vendor/js/foundation/jquery.foundation.orbit',
    'jquery.foundation.topbar': '../vendor/js/foundation/jquery.foundation.topbar',
    'jquery.tinymce': '../vendor/js/tiny_mce/jquery.tinymce',
    'ace': '../vendor/js/ace',
    backbone: '../vendor/js/backbone-0.9.2',
    underscore: '../vendor/js/underscore-1.4.2',
    ymaps: "http://api-maps.yandex.ru/2.0/?load=package.full&lang=ru-RU"
  },
  shim: {
    'stonegarden': ['jquery'],
    'jquery.ui': ['jquery'],
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
    },
    ymaps: {
      exports: "ymaps"
    }
  }
});

require(["blocks", "documents", "notary"]);

require(["jquery"
       , "jquery.ui"
       , "plugins/jquery.responsive"
       , "plugins/jquery.splash"
       , "plugins/jquery.gallery"
       , "jquery.foundation.topbar"
       , "plugins/jquery.legacy"
       , "plugins/jquery.lightbox"
       , "plugins/jquery.notaries_map"], function($) {

  $(document).foundationTopBar();

  $.datepicker.regional[ "ru" ] = {
    closeText: "Закрыть",
    prevText: "&#x3c;Пред",
    nextText: "След&#x3e;",
    currentText: "Сегодня",
    monthNames: [ "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
        "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь" ],
    monthNamesShort: [ "января", "февраля", "марта", "апреля", "мая", "июня",
        "июля", "августа", "сентября", "октября", "ноября", "декабря" ],
    dayNames: [ "Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота" ],
    dayNamesShort: [ "вск", "пнд", "втр", "срд", "чтв", "птн", "сбт" ],
    dayNamesMin: [ "Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб" ],
    weekHeader: "Не",
    dateFormat: "yy.mm.dd",
    firstDay: 1,
    isRTL: false,
    showMonthAfterYear: false,
    yearSuffix: ''
  };

  $.datepicker.setDefaults( $.datepicker.regional[ document.documentElement.lang ] );


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
