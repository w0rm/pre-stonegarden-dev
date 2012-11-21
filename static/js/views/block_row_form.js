define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "models/block"
      , "views/form"
      , "jquery.tinymce"], function ($, _, Backbone, sg) {

  var views = sg.views
    , NavBlockForm;


  RowBlockForm = views.Form.extend({

    template: _.template($("#block-row-form-template").html()),

    events: _.extend({
      "change .js-size": "changeColumns"
    }, views.Form.prototype.events),

    initialize: function() {
      this.attrs = this.options.attrs;
    },

    serializeObject: function() {
      return _.extend(
        this.attrs,
        sg.utils.serializeObject(this.$el),
        { sizes: this.getSizes() }
      );
    },

    getTemplateAttributes: function() {
      return this.hasModel() ?
      {
        block: this.model.toJSON(),
      } :
      {
        block: {
          sizes: [3, 3, 3, 3]
        },
      }
    },

    getSizes: function() {
      var size = this.$size.val()
        , sizes = [];

      this.$columns.each(function(i, col) {
        if (i < size) {
          sizes.push($(col).find("input").val())
        }
      });

      return sizes;
    },

    changeColumns: function() {

      var size = this.$size.val()
        , sizes = this.getSizes();

      this.$columns.each(function(i, col) {
        var $col = $(col)
          , $size = $col.find("input");

        $col.attr("class", "sg-block-column-" + sizes[i]);
        $col.toggleClass("sg-hidden", i >= size);

      });

    },

    render: function() {
      this.$el.html(this.template(this.getTemplateAttributes()));
      this.$size = this.$(".js-size");
      this.$columns = this.$(".js-columns").children();
      return this;
    }


  });



  views.RowBlockForm = Backbone.View.extend({

    initialize: function() {
      this.formView = new RowBlockForm({
        model: this.model,
        collection: this.collection,
        attrs: this.options.attrs
      }).on("all", this.proxyEvent, this)
    },

    proxyEvent: function() {
      this.trigger.apply(this, arguments);
    },

    render: function() {
      new views.Modal({
        contentView: this.formView
      }).open();
      return this;
    }

  });



});
