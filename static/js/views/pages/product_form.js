define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/pages/form"], function ($, _, Backbone, sg) {

  var views = sg.views;


  views.ProductPageForm = views.PageForm.extend({

    template: _.template($("#product-form-template").html()),

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

    disabledFilter: function(p) {
      return p.get("type") === "catalog";
    }

  });

  return views.ProductPageForm;


});
