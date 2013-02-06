define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/pages/form"], function ($, _, Backbone, sg) {

  var views = sg.views;

  views.NewsPageForm = views.PageForm.extend({

    template: _.template($("#news-form-template").html()),

    serializeObject: function() {
      var result = _.extend(
        {
          is_published: this.$("[name=is_published]").is(":checked") ? true : "",
          is_navigatable: ""
        },
        this.attrs,
        sg.utils.serializeObject(this.$el)
      );
      result.name = result.title;
      return result;
    },

    pagesFilter: function(p) {
      return _.contains(["news_index"], p.get("type"));
    },

    render: function() {
      views.PageForm.prototype.render.call(this);
      // TODO: init datetime
      return this;
    }

  });

  return views.CategoryPageForm;


});
