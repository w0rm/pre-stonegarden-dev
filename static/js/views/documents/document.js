define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/mixins/has_contextmenu"
      , "views/modal"
      , "views/delete_modal"
      , "views/documents/attributes"], function ($, _, Backbone, sg) {

  var utils = sg.utils
    , views = sg.views
    , mixins = sg.mixins;

  views.Document = Backbone.View.extend(_.extend({}, mixins.hasContextMenu, {

    tagName: "li",

    className: "sg-document",

    template: _.template($("#document-template").html()),

    events: _.extend({

      "dblclick": "openDocument"

    }, mixins.hasContextMenu.events),

    initialize: function() {
      this.model
        .on("document:delete", this.deleteDocument, this)
        .on("document:attributes", this.editAttributes, this)
        .on("destroy", this.remove, this)
        .on("change:title", this.render, this)
        .on("change:is_published", this.changePublished, this)
        .on("change:position", function(m, pos) {
          this.$el.attr("data-position", pos);
        }, this);
    },

    render: function() {
      this.$el
        .attr("class", "sg-document sg-document-" + this.model.get("type"))
        .html(this.template({"document": this.model.toJSON()}));
      this.changePublished();
      return this;
    },

    changePublished: function() {
      this.$el.toggleClass("sg-not-published", !this.model.get("is_published"));
    },

    deleteDocument: function() {
      new views.DeleteModal({
        model: this.model,
        title: t_("Delete this file or folder?"),
        message: t_("It will also delete all the nested files.")
      }).open();
    },

    editAttributes: function() {
      new views.Modal({
        contentView: new views.DocumentAttributes({model: this.model})
      }).open();
    },

    openDocument: function() {
      this.model.trigger("document:open", this.model);
    }


  }));

});
