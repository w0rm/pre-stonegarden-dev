define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "utils"
      , "models/documents/document"], function ($, _, Backbone, sg) {

  var collections = sg.collections || (sg.collections = {})
    , models = sg.models
    , utils = sg.utils;

  collections.Documents = Backbone.Collection.extend({

    model: models.Document,

    url: "/a/documents",

    initialize: function() {
      this
        .on("add remove", this.updatePositions, this)
        .on("change:chosen", this.unselectDocuments, this);
      this.ajaxQueue = $({});
    },

    unselectDocuments: function(selectedModel, chosen) {
      if (!chosen) return;
      this.each(function(model) {
        if (selectedModel !== model) {
          model.set('chosen', false);
          model.trigger('document:deselect');
        } else {
          model.set('chosen', true);
          model.trigger('document:select');
          model.trigger('document:chosen');
        }
      });
    },

    getSelectedDocument: function() {
      return this.find(function(model) {
        return model.chosen;
      });
    },

    updatePositions: function(model, collection, options) {
      this.each(function(m, index) {
        m.set({position: index + 1});
      })
    },

    getUploadPosition: function() {
      // Returns position (index+1) after the last folder
      var position = 1;

      this.each(function(d, index) {
        if (d.get("type") === "folder") {
          position = index + 2;
        };
      });

      return position;
    },

    create: function(model, options) {
      var jqXHR
        , dfd = $.Deferred()
        , promise = dfd.promise()
        , coll = this;

      // queue our ajax request
      this.ajaxQueue.queue(doRequest);

      // add the abort method
      promise.abort = function(statusText) {
        // Proxy abort to the jqXHR if it is active
        if (jqXHR) {
          return jqXHR.abort(statusText);
        }

        // If there wasn't already a jqXHR we need to remove from queue
        var queue = this.ajaxQueue.queue()
          , index = $.inArray(doRequest, queue);

        if (index > -1) {
          queue.splice(index, 1);
        }

        // Reject the deferred
        dfd.rejectWith(options.context || options,
                       [promise, statusText, ""]);

        return promise;
      };

      // Run the actual collection.create
      function doRequest(next) {
        options = options ? _.clone(options) : {};
        model = coll._prepareModel(model, options);
        if (!model) return false;
        if (!options.wait) coll.add(model, options);
        var success = options.success;
        options.success = function(nextModel, resp, xhr) {
          if (options.wait) coll.add(nextModel, options);
          if (success) {
            success(nextModel, resp);
          } else {
            nextModel.trigger('sync', model, resp, options);
          }
        };
        jqXHR = model.save(null, options)
          .done(dfd.resolve)
          .fail(dfd.reject)
          .then(next, next);
      };

      return promise;
    }

  });

});
