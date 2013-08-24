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
      // TODO: use type instead of template
      templ = attrs.template
      switch (templ) {
        case "page":
          return "Page";
        case "index_page":
          return "Page";
        case "column":
          return "Column";
        case "row":
          return "Row";
        case "nav":
          return "Nav";
        case "page_title":
          return "PageTitle";
        default:
          if (attrs.type === "image") {
            return "Image"
          } else if (attrs.type === "gallery") {
            return "Gallery"
          } else {
            return ""
          }
      }
    },

    guessPageType: function(attrs) {
      if (attrs.type === "page" || attrs.type === "index_page") {
        return ""
      } else {
        var t = attrs.type.charAt(0).toUpperCase() + attrs.type.slice(1)
        t = t.replace("_", "-")
        return $.camelCase(t)
      }
    },

    getParentPath: function(path) {
      if (path.lastIndexOf("/") > 0) {
        return path.substr(0, path.lastIndexOf("/"))
      } else {
        return "/"
      }
    },

    // Returns a range object
    // Author: Matthias Miller
    // Site:   http://blog.outofhanwell.com/2006/03/29/javascript-range-function/
    range:  function() {
      var min, max, step, a = [];
      if ( !arguments.length ) {
          return [];
      }
      if ( arguments.length == 1 ) {
          min  = 0;
          max  = arguments[ 0 ] - 1;
          step = 1;
      } else {
          // default step to 1 if it's zero or undefined
          min  = arguments[ 0 ];
          max  = arguments[ 1 ] - 1;
          step = arguments[ 2 ] || 1;
      }
      // convert negative steps to positive and reverse min/max
      if ( step < 0 && min >= max ) {
          step *= -1;
          var tmp = min;
          min = max;
          max = tmp;
          min += ( ( max - min ) % step );
      }
      for ( var i = min; i <= max; i += step ) {
          a.push( i );
      }
      return a;
    },

    timify: function(time) {
      if (time < 10) {
        return "0" + time;
      } else {
        return time;
      }
    }

  });

  window.t_ = utils.translate;

});
