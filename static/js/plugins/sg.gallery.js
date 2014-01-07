define(["jquery", "fotorama"], function ($) {
  

  $.fn.gallery = function (option) {
    var $rama = this.each(function () {
      var $this = $(this);
      var iscaption = $this.data('iscaption') || false; //feels ugly → refactor
      var options = $.extend({}, 
                        $.fn.gallery.defaults,
                        $this.data(), 
                        typeof option == 'object' && option);
      $this.fotorama(options);
      var fotorama = $this.data('fotorama');
      if (iscaption){
        // fix caption for initial frame
        fotorama.$caption = fotorama.$caption || $this.next('.gallery-caption');
        fotorama.$caption.html('<span class="h">'+fotorama.activeFrame.caption+'</span> <span class="small">'+fotorama.activeFrame.description+'</span>');
        // redirect fotorama caption
        $this.on('fotorama:ready fotorama:show', function (e, fotorama) {
          fotorama.$caption = fotorama.$caption || $this.next('.gallery-caption');
          fotorama.$caption.html('<span class="h">'+fotorama.activeFrame.caption+'</span> <span class="small">'+fotorama.activeFrame.description+'</span>');
        });
      }
    });
    return $rama;
  };

  $.fn.gallery.defaults = {
    allowfullscreen :true,
    nav :"dots",
    hash :true,
    fit :"contain",
    keyboard :true,
    arrows :true,
    click :true, 
    swipe :true,
    trackpad :true,
    width :"100%",
    ratio :"100/67"
  };

});
