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

    tagName: 'li',

    getClassName: function () {
      var className = 'sg-document'
      if (!this.model.get('is_published')) className += " sg-not-published"
      if (this.model.get('type')) className += " sg-document-" + this.model.get("type")
      return className
    },

    template: _.template($("#document-template").html()),

    events: _.extend({

      "dblclick": "openDocument",
      "click": "toggleSelected"

    }, mixins.hasContextMenu.events),

    initialize: function(options) {
      this.options = options || {};
      this.model
        .on("document:delete", this.deleteDocument, this)
        .on("document:attributes", this.editAttributes, this)
        .on("document:copyLink", this.copyLink, this)
        .on("destroy", this.remove, this)
        .on("change:title change:is_published change:isSelected",
            this.render, this)
        .on("change:position", function(m, pos) {
          this.$el.attr("data-position", pos);
        }, this);
    },

    render: function() {
      this.$el
        .attr('class', this.getClassName())
        .html(this.template({"document": this.model.toJSON()}))
        .data({id: this.model.get('id')})
      return this;
    },

    toggleSelected: function() {
      if (this.options.isSelectable) {
        this.model.set('isSelected', !this.model.get('isSelected'));
      }
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
