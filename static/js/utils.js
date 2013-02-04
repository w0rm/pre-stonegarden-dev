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
      switch (attrs.template) {
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
        case "categories":
          return "Categories";
        case "products":
          return "Products";
        case "subcategories_nav":
          return "SubcategoriesNav";
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
      if (attrs.type === "page") {
        return ""
      } else {
        var t = attrs.type.charAt(0).toUpperCase() + attrs.type.slice(1)
        t = t.replace("_", "-")
        t = $.camelCase(t)
        console.log(t)
        return t
      }
    },

    timify: function(time) {
      if (time < 10) {
        return "0" + time;
      } else {
        return time;
      }
    },

    dateFromString: function(dateAsString) {
      var parts, pattern;
      pattern = new RegExp("(\\d{4})-(\\d{2})-(\\d{2}) (\\d{2}):(\\d{2}):(\\d{2})");
      parts = dateAsString.match(pattern);
      if (parts) {
        return new Date(parseInt(parts[1], 10), parseInt(parts[2], 10) - 1, parseInt(parts[3], 10), parseInt(parts[4], 10), parseInt(parts[5], 10), parseInt(parts[6], 10), 0);
      } else {
        return null;
      }
    },

    getParentPath: function(path) {
      if (path.lastIndexOf("/") > 0) {
        return path.substr(0, path.lastIndexOf("/"))
      } else {
        return "/"
      }
    }

  });

  window.t_ = utils.translate;

});
