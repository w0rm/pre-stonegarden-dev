define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"], function ($, _, Backbone, sg) {

  var views = sg.views || (sg.views = {});


  views.ContextMenu = Backbone.View.extend({

    className: "sg-contextmenu-item sg-contextmenu-show",

    events: {

    },

    render: function() {
      this.$el.empty().append(
        '<span class="sg-ico-menu-list" />',
        this.renderMenu(this.model.getContextMenu())
      )
      return this;
    },

    renderMenu: function(menu) {
      var $menu = $('<ul class="sg-contextmenu"/>');
      _.each(menu.items, function(item) {
        var $item = $('<li/>').appendTo($menu);
        if (item.is_separator) {
          $item.addClass("sg-contextmenu-separator");
        } else {
          $item.addClass("sg-contextmenu-item");
          if (item.items) {
            $item.append(
              "<span>" + item.text + "</span>",
              this.renderMenu(item)
            );
            $item.hover(
              function(){ item.context.highlight(); },
              function(){ item.context.lowlight(); }
            );
          } else {
            $item.hover(
              function(){ menu.context.highlight(); },
              function(){ menu.context.lowlight(); }
            );
            if (item.click) {
              $item.append(
                $('<a href="#">' + item.text + '</a>').click(function(e){
                  e.preventDefault();
                  item.click.call(menu.context);
                })
              )
            } else {
              $item.append(
                $('<a>' + item.text + '</a>').attr("href", item.href)
              );
            }
          }
        }
      }, this);
      return $menu;
    }

  });


});
