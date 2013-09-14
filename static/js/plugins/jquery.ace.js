define(["jquery"], function ($) {


  // Class definition

  var Ace = function(element, options) {
    this.options = options
    this.$element = $(element)
    this.$ace = $("<div class='sg-ace'></div>")
    this.$element.hide().after(this.$ace)
    require(['ace'], $.proxy(this.init, this))
  }

  Ace.prototype = {
    init: function (ace) {
      var self = this;
      this.editor = ace.edit(this.$ace.get(0))
      this.editor.setFontSize(this.options.fontSize)
      this.editorSession = this.editor.getSession()
      this.editorSession.setMode('ace/mode/' + this.options.mode);
      this.editorSession.setValue(this.$element.val());
      this.editorSession.on('change', function(){
        self.$element.val(self.editorSession.getValue()).change();
      });
    }
  }

  // Plugin definition

  $.fn.ace = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('ace')
        , options = $.extend({}, $.fn.ace.defaults,
                             $this.data(), typeof option == 'object' && option)
      if (!data) {
        data = new Ace(this, options)
        $this.data('ace', data)
      }
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.ace.defaults = {
    mode: "html",
    fontSize: 10
  }

  $.fn.ace.Constructor = Ace

  return Ace

});
