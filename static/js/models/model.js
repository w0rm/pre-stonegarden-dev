define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "utils"], function ($, _, Backbone, sg) {


  var models = sg.models || (sg.models = {});

  models.Model = Backbone.Model.extend({
    sync: function (method, model, options) {
      var self = this
        , data
        , methodMap = {
          'create': 'POST',
          'update': 'PUT',
          'delete': 'DELETE',
          'read':   'GET'
        }
        , params = {
          type:     methodMap[method],
          dataType: 'json',
          url :      sg.utils.getValue(model, 'url') || this.urlError(),
          headers:  {
            // "X-CSRF-Token": $("meta[name=csrf-token]").attr("content")
          }
        };

      if (method == 'create' || method == 'update') {
        if (sg.utils.isFormDataSupported()) {
          data = new FormData();
          $.each(model.toJSON(), function (name, value) {
            if ($.isArray(value)) {
              if (value.length > 0) {
                $.each(value, function(index, item_value) {
                  data.append(name, item_value);
                })
              }
            } else {
              data.append(name, value)
            }
          });
          params.contentType = false;
          params.processData = false;
        } else {
          data = model.toJSON();
          params.contentType = "application/x-www-form-urlencoded";
          params.processData = true;
        }
        params.data = data;
      }

      return $.ajax(_.extend(params, options));
    },

    // Copy-paste port from Backbone.js because they made it unavailable
    // for third-party code
    urlError: function() {
      throw new Error('A "url" property or function must be specified');
    }


  });


});
