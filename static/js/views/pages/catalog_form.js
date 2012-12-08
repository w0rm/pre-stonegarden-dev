define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/pages/form"], function ($, _, Backbone, sg) {

  var views = sg.views;


  views.CatalogPageForm = views.PageForm.extend({

    template: _.template($("#catalog-form-template").html()),

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

    getTemplateAttributes: function() {
      var page = this.hasModel() ? this.model.toJSON() : {};

      return {
        hasModel: this.hasModel(),
        page: page,
        parentId: this.attrs.parent_id,
      };

    }


  });

  return views.CatalogPageForm;


});
