require.config({
  paths: {
    stonegarden: '/a/config',
    jquery: '../vendor/js/jquery-1.8.1',
    'jquery.ui': '../vendor/js/jquery-ui-1.10.1.custom',
    'jquery.foundation': '../vendor/js/foundation/foundation',
    'jquery.foundation.reveal': '../vendor/js/foundation/foundation.reveal',
    'jquery.foundation.orbit': '../vendor/js/foundation/foundation.orbit',
    'jquery.foundation.topbar': '../vendor/js/foundation/foundation.topbar',
    'jquery.tinymce': '../vendor/js/tiny_mce/jquery.tinymce',
    ace: '../vendor/js/ace/ace',
    backbone: '../vendor/js/backbone-0.9.2',
    underscore: '../vendor/js/underscore-1.4.2'
  },
  shim: {
    'stonegarden': ['jquery'],
    'jquery.ui': ['jquery'],
    'jquery.tinymce': ['jquery'],
    'jquery.foundation': ['jquery'],
    'jquery.foundation.reveal': ['jquery.foundation'],
    'jquery.foundation.orbit': ['jquery.foundation'],
    'jquery.foundation.topbar': ['jquery.foundation'],
    ace: {exports: 'ace'},
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
       , "jquery.ui"
       , "plugins/jquery.responsive"
       , "plugins/jquery.gallery"
       , "jquery.foundation.topbar"], function($) {

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
    $(document).foundation('topbar');
    $(".responsive").responsiveImage()
    $(".js-gallery").gallery()
    var svg = !!('createElementNS' in document &&
      document.createElementNS('http://www.w3.org/2000/svg','svg').createSVGRect)
    if (!svg) document.body.className += ' no-svg'
  });
});
