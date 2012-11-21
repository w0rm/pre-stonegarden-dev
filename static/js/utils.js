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
    },

    translate: function(s) {
      return (sg.i18n && sg.i18n[s]) ? sg.i18n[s] : s
    },

    getValue: function(object, prop, args) {
      if (!(object && object[prop])) return null;
      return _.isFunction(object[prop]) ?
        object[prop].apply(object, args) :
        object[prop];
    },

    isFormDataSupported: function(){ return !!window.FormData },

    guessBlockType: function(attrs) {
      switch (attrs.template) {
        case "page":
          return "Page";
        case "column":
          return "Column";
        case "row":
          return "Row";
        case "nav":
          return "Nav";
        default:
          return "";
      }
    }

  });

  window.t_ = utils.translate;

});
