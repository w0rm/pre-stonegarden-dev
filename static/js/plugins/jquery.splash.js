define(["jquery"], function ($) {

  var splashs = [];

  // Class definition

  var Splash = function(element, options) {

    this.options = options
    this.$element = $(element)

    this.$image = this.$element.find(".js-splash-image")
    this.$blueprint = this.$element.find(".js-splash-blueprint")
    this.$thumbs = this.$element.find(".js-splash-thumb").each(function(){
      var $thumb = $(this)
        , image = new Image
        , blueprint = new Image
      image.src = $thumb.data("image")
      blueprint.src = $thumb.data("blueprint")
    })

    this.$element.on("mouseenter", ".js-splash-thumb",
                     $.proxy(this.select, this))

    this.$activeThumb = this.$element.find(".js-splash-thumb.is-active")
      .removeClass("is-active")
    if (this.$activeThumb.length === 1) {
      this._select(this.$activeThumb)
    }

    $(window).on("resize", $.proxy(this.positionBackground, this))

  }

  Splash.prototype = {

    select: function(e) {
      this._select($(e.currentTarget));
    },

    positionBackground: function() {
      if (this.$activeThumb.length !== 1) return;

      var thumbOffset = this.$activeThumb.offset()
        , imageOffset = this.$element.offset()
        , imageWidth = this.$element.width()
        , top = imageOffset.top - thumbOffset.top - 1 + "px"
        , left = imageOffset.left - thumbOffset.left - 1 - Math.round((1400 - imageWidth) / 2) + "px"

      this.$thumbs.css("background", "transparent")
      this.$activeThumb.css("background",
          "url(" + this.$activeThumb.data("image") + ") " +
          left + " " + top + " no-repeat")
    },

    _select: function($thumb) {
      var self = this;

      if ($thumb.hasClass("is-active")) return;
      this.$activeThumb.css("background", "transparent")
      this.$activeThumb = $thumb
      this.$thumbs.removeClass("is-active")
      this.$activeThumb.addClass("is-active")
      this.$image.stop().fadeOut(200, function() {
        self.$image.css("background", "url(" + $thumb.data("image") + ") top center no-repeat")
        self.$blueprint.css("background", "url(" + $thumb.data("blueprint") + ") top center no-repeat")
        self.positionBackground()
        self.$image.fadeIn(200)
      })
    }

  }

  // Plugin definition

  $.fn.splash = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('splash')
        , options = $.extend({}, $.fn.splash.defaults,
                             $this.data(), typeof option == 'object' && option)
      if (!data) {
        data = new Splash(this, options)
        splashs.push(data)
        $this.data('splash', data)
      }
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.splash.defaults = {}

  $.fn.splash.Constructor = Splash

  return Splash

});
