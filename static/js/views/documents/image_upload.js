define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "models/documents/document"], function ($, _, Backbone, sg) {

  var utils = sg.utils
    , views = sg.views
    , collections = sg.collections
    , models = sg.models;


  views.ImageUpload = Backbone.View.extend({

    events: {
      "change input[name=upload]": "changeEvent",
      "dragover": "dragoverEvent",
      "dragleave": "dragleaveEvent",
      "dragenter": "dragenterEvent",
      "dragmove": "dragenterEvent",
      "drop": "dropEvent",
      "click .js-delete": "deleteImage"
    },

    initialize: function() {
      var image_id
      this.$imageId = this.$(".js-image_id")
      image_id = this.$imageId.val()
      if (image_id) {
        this.$el.addClass("is-loading")
        this.model = new models.Document({id: image_id})
          .on("change", this.uploadComplete, this)
        this.model.fetch()
      }
    },

    uploadFile: function(file) {
      var filename = file.name.substr(0, file.name.lastIndexOf("."))
        , self = this
      this.$el.addClass("is-loading")
      this.$el.find(".js-image").remove()
      this.$el.find(".js-delete").remove()
      this.model = new models.Document({
        upload: file,
        parent_id: this.$el.data("parent_id") || 1
      })
      .on("sync", this.uploadComplete, this)

      this.model.save({wait: true});
      return this;
    },

    uploadComplete: function(model) {
      this.$el.prepend("<img class='js-image' src='" + model.get("src") + "'>")
      this.$el.removeClass("is-loading")
      this.$imageId.val(model.get("id"))
      this.$el.append("<button class='button tiny js-delete sg-ico-close'></button>")
    },

    deleteImage: function(e) {
      e.preventDefault()
      this.model = null
      this.$imageId.val("")
      this.$el.find(".js-image, .js-delete").remove()
    },

    changeEvent: function(e) {
      this.uploadFile(e.target.files[0]);
      // Empty file input value:
      e.target.outerHTML = e.target.outerHTML;
    },

    dragoverEvent: function(e) {
      e.originalEvent.preventDefault();
      var dt;
      dt = e.originalEvent.dataTransfer;
      if (!dt || !dt.files) {
        return true;
      }
      dt.dropEffect = "copy";
      return false;
    },

    dragleaveEvent: function(e) {
      if (this.$el.is(e.target)){
        this.$el.removeClass("is-dropped");
      }
    },

    dragenterEvent: function(e) {
      this.$el.addClass("is-dropped");
      return false;
    },

    dropEvent: function(e) {
      e.originalEvent.preventDefault();
      var dt;
      this.$el.removeClass("is-dropped");
      dt = e.originalEvent.dataTransfer;
      if (!dt || !dt.files || dt.files.length > 1) {
        return true;
      };
      this.uploadFile(dt.files[0]);
      return false;
    }

  });

});
