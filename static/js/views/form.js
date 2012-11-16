define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"], function ($, _, Backbone, sg) {

  var utils = sg.utils
    , views = sg.views || (sg.views = {});


 widgets.Form = Backbone.View.extend({
    events: {
      "submit": "submitEvent",
      "reset": "resetEvent"
    },

    initialize: function() {
      this._isSync = false;
      this._hasModel  = !!this.model;
    },

    // Events
    submitEvent: function(e) {
      var self = this;
      e.preventDefault();
      e.stopPropagation();
      this.enterSyncState(function(){
        var params = {
          wait: true,
          success: function() {
            self.successEvent.apply(self, arguments);
          },
          error: function() {
            self.errorEvent.apply(self, arguments);
          }
        };
        if (this._hasModel) {
          this.model.save(this.serializeObject(), params);
        } else {
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
      !this._hasModel && this.reset();
      this.trigger("success");
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
