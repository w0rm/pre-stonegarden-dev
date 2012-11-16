define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"], function ($, _, Backbone, sg) {


  var utils = sg.utils || (sg.utils = {});


  _.extend(utils, {

    serializeObject: function(element) {
      var $el = $(element),
        $form = $el.is("form") ? $el : $el.find("form"),
        params = $form.serializeArray(),
        o = {};

      $.each(params, function() {
        if (this.name in o) {
          if (!$.isArray(o[this.name])) {
            o[this.name] = [o[this.name]];
          }
          o[this.name].push(this.value);
        } else {
          o[this.name] = this.value;
        }
      });
      return o;
    }

  });


});
