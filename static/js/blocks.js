define(['jquery', 'underscore', 'stonegarden', 'views/block'], function ($, _, sg) {
  $(function() {

    var views = sg.views
      , models = sg.models
      , collections = sg.collections;

    if (window.sgData && window.sgData.pageBlock) {

      // init page block model
      sg.pageBlock = new models.PageBlock;
      sg.pageBlock.set(window.sgData.pageBlock);

      // init template blocks collection
      sg.templateBlocks = new collections.Blocks();
      sg.templateBlocks.reset(window.sgData.templateBlocks);

      // init main view
      new views.Block({
        model: sg.pageBlock,
        el: sg.pageBlock.get("html")
      }).render().$el.appendTo("body");

    }

  });
});
