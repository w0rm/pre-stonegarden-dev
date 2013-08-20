define(["underscore"
      , "backbone"
      , "stonegarden"], function (_, Backbone, sg) {

  sg.buffer = _.extend({

    save: function(key, value) {

      if (!key || !value) {return;}

      if (typeof value == "object") {
        value = JSON.stringify(value);
      }

      localStorage.setItem(key, value);

      this.trigger("save:" + key);

    },

    load: function(key) {
      var value = localStorage.getItem(key);

      if (!value) {return;}

      // assume it is an object that has been stringified
      if (value[0] == "{") {
        value = JSON.parse(value);
      }

      this.trigger("load:" + key, value);

      return value;
    },

    has: function(key) {
      return !! localStorage.getItem(key);
    }

  }, Backbone.Events);


  return sg.buffer;

});


