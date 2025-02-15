define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "utils"], function ($, _, Backbone, sg) {

  var utils = sg.utils
    , views = sg.views || (sg.views = {});


 views.Form = Backbone.View.extend({

    events: {
      "submit": "submitEvent",
      "reset": "resetEvent"
    },

    hasModel: function() {
      return !!this.model;
    },

    // Events
    submitEvent: function(e) {
      var self = this;
      e.preventDefault();
      e.stopPropagation();
      this.enterSyncState(function(){
        var data = this.serializeObject()
          , params = {
            wait: true,
            success: function() {
              self.successEvent.apply(self, arguments);
            },
            error: function() {
              self.errorEvent.apply(self, arguments);
            }
          };

        if (this.hasModel()) {
          this.model.save(this.serializeObject(), params);
        } else {
          // data.position is positive number
          // @at specifies index of new model in collection
          // http://backbonejs.org/#Collection-add
          if (data.position) {
            params.at = data.position - 1;
          };
          this.collection.create(this.serializeObject(), params);
        }
      });
    },

    resetEvent: function(event) {
      // Don't propagete this event to parent views
      event.stopPropagation();
      this.hideErrors();
      this.trigger("reset");
    },

    successEvent: function(model) {
      this.exitSyncState().hideErrors();
      this.trigger("success", model);
      //!this.hasModel() && this.reset();
    },

    errorEvent: function (model, errors) {
      // Show either a server errors or validation errors
      this.exitSyncState().showErrors(
        _.has(errors, "responseText") ?
          $.parseJSON(errors.responseText)["errors"] : errors
      );
      this.trigger("error", [model, errors]);
    },

    serializeObject: function() {
      return sg.utils.serializeObject(this.$el);
    },

    enterSyncState: function(callback) {
      // Prevent double submit
      if (this._isSync) return this;
      this._isSync = true;
      callback.call(this);
      return this;
    },

    exitSyncState: function() {
      this._isSync = false;
      return this;
    },

    showErrors: function(errors) {},

    hideErrors: function() {},

    submit: function() {
      this.$el.trigger("submit");
      return this;
    },

    reset: function() {
      this.$el.trigger("reset");
      return this;
    }

  });

});
