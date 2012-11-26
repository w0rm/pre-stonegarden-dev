define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/contextmenu"
      , "views/modal"
      , "views/documents/delete"], function ($, _, Backbone, sg) {

  var utils = sg.utils
    , views = sg.views;

  views.Document = Backbone.View.extend({

    tagName: "li",

    className: "sg-document js-document",

    template: _.template($("#document-template").html()),

    render: function() {
      this.$el
        .addClass("sg-document-" + this.model.get("type"))
        .html(this.template({"document": this.model.toJSON()}));
      return this;
    }


  });

});
