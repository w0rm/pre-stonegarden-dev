define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/pages/form"], function ($, _, Backbone, sg) {

  var views = sg.views;


  views.CategoryPageForm = views.PageForm.extend({

    template: _.template($("#category-form-template").html()),

    serializeObject: function() {
      var result = _.extend(
        {
          is_published: this.$("[name=is_published]").is(":checked") ? true : "",
          is_navigatable: true
        },
        this.attrs,
        sg.utils.serializeObject(this.$el)
      );
      result.name = result.title;
      return result;
    },

    pagesFilter: function(p) {
      return _.contains(["catalog", "category"], p.get("type"));
    },

    render: function() {
      views.PageForm.prototype.render.call(this);
      this.$("[name=description]").tinymce(sg.config.tinymce);
      return this;
    }

  });

  return views.CategoryPageForm;


});
