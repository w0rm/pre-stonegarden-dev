define(["jquery"], function ($) {

  var responsiveImages = [];

  // Class definition

  var ResponsiveImage = function(element, options) {
    this.options = options;
    this.$element = $(element);
    this.respond();
  }

  ResponsiveImage.prototype = {

    getClosestSize: function(width) {
      var size = this.options.sizes[this.options.sizes.length - 1]
      $.each(this.options.sizes, function(){
        if (this.width >= width ) {
          size = this
          return false
        }
      })
      return size
    },

    respond: function() {

      var width = this.$element.width()
        , size;
      if (!this.size || width > this.size.width) {
        // If image width is larger than current size width
        size = this.getClosestSize(width);
        if (!this.size || this.size.width < size.width ) {
          this.resize(size)
        }
      }
    },

    resize: function(size) {
      this.size = size
      if (this.options[size.name + "_src"]) {
        this.$element.attr("src", this.options[size.name + "_src"])
      }
    }

  }

  // Plugin definition

  $.fn.responsiveImage = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('responsiveImage')
        , options = $.extend({}, $.fn.responsiveImage.defaults,
                             $this.data(), typeof option == 'object' && option)
      if (!data) {
        data = new ResponsiveImage(this, options)
        responsiveImages.push(data)
        $this.data('responsiveImage', data)
      }
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.responsiveImage.defaults = {
    // sizes should be sorted by width
    sizes: [
      {width: 400, name: "s"},
      {width: 800, name: "m"},
      {width: 1024, name: "l"}
    ]
  }

  $.fn.responsiveImage.Constructor = ResponsiveImage

  // Events
  $(window).resize(function (e) {
      $.each(responsiveImages, function() {
        this.respond()
      });
  })

  return ResponsiveImage

});
