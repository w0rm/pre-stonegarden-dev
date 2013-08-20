define(['jquery'
      , 'underscore'
      , 'stonegarden'
      , 'views/notary/notary_regions'
      , 'models/notary/region'
      , 'models/notary/regions'
      , 'models/notary/notary'
      , 'models/notary/notaries'], function ($, _, sg) {

  $(function() {

    var views = sg.views
      , models = sg.models
      , collections = sg.collections
      , utils = sg.utils;

    if (window.sgData && typeof window.sgData.regions != "undefined") {
      sg.regions = new collections.Regions
      sg.regions.reset(window.sgData.regions)
      new views.NotaryRegions({
        collection: sg.regions
      }).render().$el.appendTo("body");
    }


  });

});
