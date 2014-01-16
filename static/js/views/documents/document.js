define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/mixins/has_contextmenu"
      , "views/modal"
      , "views/delete_modal"
      , "views/documents/copy_link"
      , "views/documents/preview"
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

      // "dblclick": "openDocument",
      // "click": "toggleSelected",
      "mouseup" : _.debounce(function(e) {
            if (this.doucleckicked) {
                this.doucleckicked = false;
            } else {
                this.toggleSelected.call(this, e);
            }
        }, 300),

        "dblclick": function(e) {
            this.doucleckicked = true;
            this.openDocument.call(this, e);
        }

    }, mixins.hasContextMenu.events),

    initialize: function(options) {
      this.options = options || {};


      this.model
        .on("document:delete", this.deleteDocument, this)
        .on("document:preview", this.displayPreview, this)
        .on("document:attributes", this.editAttributes, this)
        .on("document:copyLink", this.copyLink, this)
        .on("destroy", this.remove, this)
        .on("change:title change:is_published change:isSelected",
            this.render, this)
        .on("change:position", function(m, pos) {
          this.$el.attr("data-position", pos);
        }, this)
        //  .on("all", function(eventName) {
        //   console.log('Document event triggerred > ',eventName);
        // });
    },

    render: function() {
      this.$el
        .attr('class', this.getClassName())
        .html(this.template({"document": this.model.toJSON()}))
        .data({id: this.model.get('id')})
      return this;
    },


    displayPreview: function(model) {

      // only for full-feature mode (standalon app)
      // (low-feature mode = we also use it to select files in dialog)
      if (this.options.isContextMenuEnabled) {
        new views.Modal({
          contentView: new views.DocumentPreview({model: this.model})
          , sizeClass: "xlarge"
        }).open();
      }
    },

    toggleSelected: function(e,t,a) {
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

    , dummyTest: function(model,collection) {
      console.log('Element — this model passed', model)
      console.log('Element —  this.model', this.model)
      console.log('Element — collection passed', collection)
      var m = this.model
      console.log('Element —  model collection', model.collection)
      // console.log('Element —  click $el', this.$el)
      this.model.collection.each(function(doc){
        console.log('each > ', doc.get('type'), doc.get('src'), doc.get('title'))
        var isThis = (model.get('id') == doc.get('id')) ? true : false ;
        if (isThis) console.log('this', model.get('id') , doc.get('id'), doc.$el)
      })
    }   

  }));

});
