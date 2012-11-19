require.config({
  urlArgs: 'bust=' + (new Date).getTime(),
  paths: {
    stonegarden: '/a/config',
    jquery: '../vendor/js/jquery-1.8.1',
    'jquery-tinymce': '../vendor/js/tiny_mce/jquery.tinymce',
    backbone: '../vendor/js/backbone-0.9.2',
    underscore: '../vendor/js/underscore-1.4.2'
  },
  shim: {
    'jquery-tinymce': ['jquery'],
    underscore: {
      exports: '_'
    },
    backbone: {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    }
  }
});

require(["blocks"]);
