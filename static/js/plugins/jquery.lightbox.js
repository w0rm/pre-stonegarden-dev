define(["jquery"], function ($) {

  // Class definition

  var $backdrop = $("<div class='lightbox-backdrop'/>").appendTo("body").hide()
    , $lightbox = $(
        '<div class="lightbox">' +
          '<div class="lightbox-content">' +
              '<div class="lightbox-close js-close">×</div>' +
              '<img src="#" class="js-image">' +
          '</div>' +
        '</div>'
      ).appendTo("body").hide()
    , $img = $lightbox.find("img")


  function closeLightbox() {
    $backdrop.fadeOut()
    $lightbox.fadeOut(function() {
      $img.hide()
    });
  }

  $lightbox.on("click", ".js-close", closeLightbox)
  $backdrop.on("click", closeLightbox)
  $(document).keyup(function(e) {
    if (e.keyCode == 27) {
      closeLightbox();
    }
  })

  var Lightbox = function(element, options) {
    this.options = options;
    this.$element = $(element).click($.proxy(this.open, this));
  }

  Lightbox.prototype = {
    getHref: function() {
      return this.options.lightbox
    },
    open: function() {
      var self = this
        , img = document.createElement("img");
      img.onload = function() {
        var width = this.width
          , height = this.height
          , maxheight = $(window).height() - 80
          , $oldImg = $img
        $img = $(img)
        $oldImg.replaceWith($img);
        if(height > maxheight) {
          $img.css({width: width * maxheight / height }).show()
        } else {
          $img.css({width: ""}).show()
        }
      }
      img.src = this.getHref()
      $backdrop.fadeIn(function(){
        $lightbox
          .css({
            top: $(document).scrollTop() + 50
          })
          .show()
      })
    }
  }

  // Plugin definition

  $.fn.Lightbox = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('Lightbox')
        , options = $.extend({}, $.fn.Lightbox.defaults, $this.data(), typeof option == 'object' && option)
      if (!data) $this.data('Lightbox', (data = new Lightbox(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }
  $.fn.Lightbox.defaults = { href: null }
  $.fn.Lightbox.Constructor = Lightbox

  // Data API

  $(document).on("click", '[data-lightbox]', function (e) {
    var $this = $(this);
    e.preventDefault()
    $this.Lightbox("open");
  })

  return Lightbox;

});
