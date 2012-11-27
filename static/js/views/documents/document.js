define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/mixins/has_contextmenu"
      , "views/modal"
      , "views/documents/delete"], function ($, _, Backbone, sg) {

  var utils = sg.utils
    , views = sg.views
    , mixins = sg.mixins;

  views.Document = Backbone.View.extend(_.extend(mixins.hasContextMenu, {

    tagName: "li",

    className: "sg-document js-document",

    template: _.template($("#document-template").html()),

    initialize: function() {
      this.model
        .on("document:delete", this.deleteDocument, this)
        .on("destroy", this.remove, this);

        /*
        .on("change:position", function(m, pos) {
          this.$(".sg-document-title").text(pos)
        }, this)
        */
    },

    render: function() {
      this.$el
        .addClass("sg-document-" + this.model.get("type"))
        .html(this.template({"document": this.model.toJSON()}));
      return this;
    },

    deleteDocument: function() {
      new views.Modal({
        contentView: new views.DocumentDelete({model: this.model})
      }).open();
    }

  }));

});
