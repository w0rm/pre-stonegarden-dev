define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/mixins/has_contextmenu"
      , "views/modal"
      , "views/delete_modal"
      , "views/documents/copy_link"
      , "views/documents/attributes"], function ($, _, Backbone, sg) {

  var utils = sg.utils
    , views = sg.views
    , mixins = sg.mixins;

  views.Document = Backbone.View.extend(_.extend({}, mixins.hasContextMenu, {

    tagName: "li",

    className: "sg-document",

    template: _.template($("#document-template").html()),

    events: _.extend({

      "dblclick": "openDocument",
      "click": "toggleSelected"

    }, mixins.hasContextMenu.events),

    initialize: function() {
      this.model
        .on("document:delete", this.deleteDocument, this)
        .on("document:attributes", this.editAttributes, this)
        .on("document:copyLink", this.copyLink, this)
        .on("document:select document:unselect", this.changeSelected, this)
        .on("document:unselect", this.unselectDocument, this)
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
        .html(this.template({"document": this.model.toJSON()}))
        .data({id: this.model.get('id')})
      this.changePublished();
      return this;
    },

    toggleSelected: function() {
      if (this.options.isSelectable) {
        this.model.toggleSelected();
      }
    },

    changeSelected: function() {
      this.$el.toggleClass("sg-selected", this.model.isSelected);
    },

    changePublished: function() {
      this.$el.toggleClass("sg-not-published", !this.model.get("is_published"));
    },

    deleteDocument: function() {
      new views.DeleteModal({model: this.model}).open();
    },

    editAttributes: function() {
      new views.Modal({
        contentView: new views.DocumentAttributes({model: this.model})
      }).open();
    },

    copyLink: function() {
      new views.Modal({
        contentView: new views.DocumentCopyLink({model: this.model})
      }).open();
    },

    openDocument: function() {
      this.model.trigger("document:open", this.model);
    }

  }));

});
