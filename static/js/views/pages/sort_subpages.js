define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "jquery.ui"], function ($, _, Backbone, sg) {

  var utils = sg.utils
    , views = sg.views || (sg.views = {})


  views.SortSubpages = Backbone.View.extend({

    template: _.template($("#page-sort-subpages-template").html()),

    events: {
      "sortupdate .js-sort-subpages": "sortupdateEvent",
      "sortstart .js-sort-subpages": "sortstartEvent"
    },

    sortstartEvent: function(e, ui) {
      // Fix the bug when placeholder doesn't get its height
      ui.placeholder.height(ui.helper.height())
    },

    sortupdateEvent: function(e, ui) {
      var pageId = ui.item.data("id")
        , position = this.$list.children().index(ui.item) + 1
        , page = this.collection.get(pageId)

      this.collection
        .remove(page, {silent: true})
        .add(page, {at: position - 1, silent: true})
        .each(function(m, index) {
          m.set({position: index + 1})
        })
      page.save().done(function(){
        //TODO: cleaner way to trigger blocks update
        sg.page.trigger("change:title", sg.page, sg.page.get("title"))
      })


    },

    render: function() {
      this.$el.html(this.template({
        pagesList: this.collection.toJSON()
      }))
      this.$list = this.$(".js-sort-subpages").sortable({
        forcePlaceholderSize: true
      })
      return this
    }

  });

  return views.SortSubpages;

});
