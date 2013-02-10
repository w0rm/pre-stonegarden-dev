define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/pages/form"
      , "jquery.ui"], function ($, _, Backbone, sg) {

  var views = sg.views;


  views.NewsPageForm = views.PageForm.extend({

    template: _.template($("#news-form-template").html()),

    serializeObject: function() {
      var result = _.extend(
        {
          is_published: this.$("[name=is_published]").is(":checked") ? true : "",
          is_navigatable: "",
          published_at: this.getPublishedDateTime(),
          slug: this.getSlug()
        },
        this.attrs,
        sg.utils.serializeObject(this.$el)
      );
      result.name = result.title
      return result
    },

    getTemplateAttributes: function() {
      return _.extend(
        views.PageForm.prototype.getTemplateAttributes.call(this),
        {
          minutesValues: _.map(sg.utils.range(0, 60, 5), sg.utils.timify),
          hoursValues: _.map(sg.utils.range(0, 24), sg.utils.timify)
        }
      )
    },

    pagesFilter: function(p) {
      return _.contains(["news_index"], p.get("type"));
    },

    getPublishedDateTime: function() {
      var date = this.$("[name=published_date]").datepicker("getDate")
        , hours = parseInt(this.$("[name=published_hours]").val())
        , minutes = parseInt(this.$("[name=published_minutes]").val())
      date.setHours(hours)
      date.setMinutes(minutes)
      return date
    },

    getSlug: function() {
      var date = this.getPublishedDateTime();
      return date.getFullYear() + "-" +
             sg.utils.timify(date.getMonth() + 1) + "-" +
             sg.utils.timify(date.getDate())
    },

    render: function() {
      var dateTime
        , timeOffsetInHours = new Date().getTimezoneOffset() / 60;

      views.PageForm.prototype.render.call(this)

      if (this.model) {
        dateTime = new Date(this.model.get("published_at"))
        // Convert UTC to local time
        dateTime.setHours(dateTime.getHours() + timeOffsetInHours)
      } else {
        dateTime = new Date;
      }

      this.$("[name=published_date]")
        .datepicker({ dateFormat: "dd M yy" })
        .datepicker( "setDate", dateTime )

      this.$("[name=published_hours]").val(
        sg.utils.timify(dateTime.getHours())
      );

      this.$("[name=published_minutes]").val(
        sg.utils.timify( ~~ (dateTime.getMinutes() / 5) * 5 )
      )

      return this;
    }

  });

  return views.CategoryPageForm;

});
