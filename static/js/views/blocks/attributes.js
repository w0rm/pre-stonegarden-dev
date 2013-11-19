define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/alert_form"
      , "jquery.tinymce"], function ($, _, Backbone, sg) {

  var views = sg.views;


  views.BlockAttributes = views.AlertForm.extend({

    template: _.template($("#block-attributes-template").html()),

    events: _.extend({
      "click .js-label": "clickLabel",
      "change [name=css_class]": "updateLabels"
    }, views.AlertForm.prototype.events),

    initialize: function(options) {
      this.options = options || {};
      this.attrs = this.options.attrs || {};
    },

    serializeObject: function() {
      return _.extend(
        {
          is_published: this.$("[name=is_published]").is(":checked")
        },
        this.attrs,
        sg.utils.serializeObject(this.$el)
      );
    },

    render: function() {
      this.$el.html(this.template({
        css_classes: sg.config.css_classes,
        block: this.model.toJSON(),
        buttonText: t_("Save")
      }))
      this.$css_class = this.$("[name=css_class]")
      this.$labels = this.$(".js-label")
      this.updateLabels()
      return this;
    },

    getClasses: function() {
      return this.$css_class.val().split(/[\s]/);
    },

    setClasses: function(classes) {
      this.$css_class.val(classes.join(" ")).change()
    },

    clickLabel: function(e) {
      e.preventDefault()
      this.toggleClass($(e.currentTarget).data("value"))
    },

    updateLabels: function(e) {
      var css_classes = this.getClasses();
      this.$labels.each(function(){
        var $label = $(this)
          , css_class = $label.data("value")
        $label.toggleClass("sg-active", _.contains(css_classes, css_class))
      })
    },

    toggleClass: function(css_class) {
      var css_classes = this.getClasses()
      if (_.contains(css_classes, css_class)) {
        this.setClasses(
          _.reject(css_classes, function(c) { return c === css_class; })
        )
      } else {
        css_classes.push(css_class)
        this.setClasses(css_classes)
      }
    }

  });


});
