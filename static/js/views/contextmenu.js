define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"], function ($, _, Backbone, sg) {

  var views = sg.views || (sg.views = {});


  views.ContextMenu = Backbone.View.extend({

    events: {
      "mousemove": "mousemoveEvent"
    },

    className: "sg-contextmenu-item sg-contextmenu-show",

    mousemoveEvent: function(e) {
      e.stopPropagation();
    },

    render: function() {
      this.$el.empty().append(
        '<span class="sg-ico-menu-list" />',
        this.renderMenu(this.model.getContextMenu())
      )
      return this;
    },

    // TODO: render with _.template and use events hash to bind
    renderMenu: function(menu) {
      var $menu = $('<ul class="sg-contextmenu"/>');
      _.each(menu.items, function(item) {
        var $item = $('<li/>').appendTo($menu);
        if (item.isSeparator) {
          $item.addClass("sg-contextmenu-separator");
        } else {
          $item.addClass("sg-contextmenu-item");
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


});
