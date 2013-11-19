define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/modal"
      , "views/alert_form"
      , "jquery.tinymce"], function ($, _, Backbone, sg) {

  var views = sg.views
    , _RowBlockForm;


  _RowBlockForm = views.AlertForm.extend({

    template: _.template($("#block-row-form-template").html()),

    events: _.extend({
      "change .js-size": "changeColumns",
      "change [name=sizes]": "changeSize"
    }, views.AlertForm.prototype.events),

    initialize: function(options) {
      this.options = options || {};
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
        sizes: this.model.blocks.pluck("size")
      } :
      {
        sizes: [3, 3, 3, 3]
      }
    },

    getSizes: function() {
      var size = this.$size.val()
        , sizes = [];

      this.$columns.each(function(i, col) {
        if (i < size) {
          sizes.push(parseInt($(col).find("input").val()));
        }
      });
      return sizes;
    },


    correctSizes: function() {
      var sizes = this.getSizes()
        , equalSize = parseInt(12 / sizes.length);

      if (!this.validSizes(sizes)) {
        // make all columns equal and set the last column to
        // remainder
        sizes = _.map(sizes, function() {
          return equalSize
        });
        sizes[sizes.length-1] = 12 - equalSize * (sizes.length - 1);
      }
      return sizes;
    },


    validSizes: function(sizes) {
      var correctValues
        , sum;

      correctValues = _.reduce(
        sizes, function(memo, size) {
          return memo && (size > 0)
        },
        true
      );

      sum = _.reduce(
        sizes, function(memo, size) {
          return memo + size
        },
        0
      );

      console.log(correctValues, sum)

      return correctValues && sum === 12;

    },


    updateColumns: function(sizes) {
      this.$columns.each(function(i, col) {
        var $col = $(col)
          , $size = $col.find("input");
        $col.attr("class", "sg-block-col-" + sizes[i]);
        $col.toggleClass("sg-hidden", i >= sizes.length);
        $size.val(sizes[i]);
      });
    },

    changeColumns: function() {
      var sizes = this.correctSizes();
      this.updateColumns(sizes);
    },

    changeSize: function() {
      var sizes = this.getSizes();
      if (this.validSizes(sizes)) {
        this.updateColumns(sizes)
      }
    },

    render: function() {
      this.$el.html(this.template(this.getTemplateAttributes()));
      this.$size = this.$(".js-size");
      this.$columns = this.$(".js-columns").children();
      return this;
    }

  });


  views.RowBlockForm = Backbone.View.extend({

    initialize: function(options) {
      this.options = options || {};
      this.formView = new _RowBlockForm({
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
