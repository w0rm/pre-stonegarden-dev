define(['jquery'
      , 'underscore'
      , 'stonegarden'
      , 'views/blocks/block'
      , 'models/blocks/block'
      , 'models/blocks/blocks'
      , 'views/pages/page'
      , 'models/pages/page'
      , 'models/pages/pages'], function ($, _, sg) {


  $(function() {

    var views = sg.views
      , models = sg.models
      , collections = sg.collections;

    if (window.sgData && window.sgData.pageBlock) {

      // init page block model
      sg.pageBlock = new models.PageBlock;
      sg.pageBlock.set(window.sgData.pageBlock);

      // init template blocks collection
      sg.templateBlocks = new collections.Blocks;
      sg.templateBlocks.reset(window.sgData.templateBlocks);

      // init main view
      new views.Block({
        model: sg.pageBlock,
        el: sg.pageBlock.get("html")
      }).render().$el.appendTo("body");

    }

    if (window.sgData && window.sgData.page ) {
      sg.page = new models.Page;
      sg.page.set(window.sgData.page);
      sg.pages = new collections.Pages;
      sg.pages.reset(window.sgData.pages);

      new views.Page({
        el: $("body"),
        model: sg.page,
        collection: sg.pages
      }).render();

    }

  });
});
