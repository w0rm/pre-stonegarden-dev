define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "views/contextmenu"], function ($, _, Backbone, sg) {

  var utils = sg.utils
    , views = sg.views;


  views.PageMenu = views.ContextMenu.extend({

    className: "sg-pagemenu-show",

    render: function() {
      this.$el.empty().append(
        this.renderParentMenu(this.model.getContextMenu())
      );
      return this;
    },

    // TODO: refractor this and contextmenu.renderMenu
    renderParentMenu: function(menu) {
      var $menu = $('<ul class="sg-pagemenu"/>');
      _.each(menu.items, function(item) {
        var $item = $('<li/>').appendTo($menu);
        if (item.is_separator) {
          $item.addClass("sg-pagemenu-separator");
        } else {
          $item.addClass("sg-pagemenu-item");
          if (item.items) {
            $item.append(
              "<span>" + item.text + "</span>",
              this.renderMenu(item)
            );
          } else {
            if (menu.context) {
              $item.hover(
                function(){ menu.context.set('isHighlighted', true) },
                function(){ menu.context.set('isHighlighted', false) }
              );
            }
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
        };

        if (item.title) {
          $item.children(":first").attr("title", item.title)
        }

        if (item.className) {
          $item.children(":first").addClass(item.className)
        }

      }, this);
      return $menu;
    }


  });


  return views.PageMenu;


});
