define(['jquery', 'underscore', 'stonegarden', 'views/block'], function ($, _, sg) {
  $(function() {

    var views = sg.views;

    new views.Block({el: "body"});

  });
});
