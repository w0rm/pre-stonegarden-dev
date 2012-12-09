define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "jquery.foundation.reveal"], function ($, _, Backbone, sg) {

  var views = sg.views || (sg.views = {});


  views.Modal = Backbone.View.extend({

    className: "reveal-modal",

    template: _.template($("#modal-template").html()),

    initialize: function() {
      this.contentView = this.options.contentView
        .on("success reset modal:close", this.close, this);
      this.$el.addClass(this.options.sizeClass || "medium");
    },

    open: function() {
      var self = this;
      this.$el.html(this.template());
      this.$(".js-content").empty().append(
        this.contentView.el
      );
      this.$el.appendTo("body");
      // Render content widget only when attached to body
      this.contentView.render();
      this.$el.reveal({
        opened: function(){ self.opened(); },
        closed: function(){ self.closed(); }
      });
      return this;
    },

    close: function() {
      this.$el.trigger('reveal:close');
    },

    opened: function() {

    },

    closed: function() {
      this.contentView
        .trigger("reset")
        .$el.detach();
      this.$el.detach();
    }

  });


});
