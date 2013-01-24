define(["jquery", "jquery.foundation.orbit"], function ($) {


  // Class definition

  var Gallery = function(element, options) {
    this.options = options;
    this.$element = $(element);

    if (this.hasThumbs()) {
      this.options.bulletThumbs = true
    }

    this.$element.orbit(this.options)

  }

  Gallery.prototype = {

    hasThumbs: function() {
      return this.$element.find("[data-thumb]").length > 0;
    }

  }

  // Plugin definition

  $.fn.gallery = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('gallery')
        , options = $.extend({}, $.fn.gallery.defaults,
                             $this.data(), typeof option == 'object' && option)
      if (!data) {
        data = new Gallery(this, options)
        $this.data('gallery', data)
      }
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.gallery.defaults = {
    bullets: true
  }

  $.fn.gallery.Constructor = Gallery

  return Gallery

});
