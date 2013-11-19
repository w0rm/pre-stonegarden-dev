define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/modal"], function ($, _, Backbone, sg) {

  var views = sg.views || (sg.views = {})
    , _Delete;

  _Delete = Backbone.View.extend({

    template: _.template($("#delete-modal-template").html()),

    events: {
      "click .js-ok": "deleteModel",
      "click .js-cancel": "closeModal"
    },

    getTemplateAttributes: function() {
      return this.model.getDeleteOptions();
    },

    render: function() {
      this.$el.html(this.template(this.getTemplateAttributes()));
      return this;
    },

    deleteModel: function(e) {
      this.model.destroy({wait: true});
      this.trigger("modal:close");
    },

    closeModal: function(e) {
      this.trigger("modal:close");
    }

  });

  views.DeleteModal = views.Modal.extend({

    initialize: function(options) {
      this.options = options || {};
      this.contentView = new _Delete(this.options);
      this.contentView
        .on("success reset modal:close", this.close, this);
      this.$el.addClass(this.options.sizeClass || "medium");
    }

  });

  return views.DeleteModal;


});
