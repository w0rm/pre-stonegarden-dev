(function() {

  $(document).on("mouseenter", ".ui-user", function(e) {
    var user;
    e.stopPropagation();
    if (!contextmenu_button.parent().is(this)) {
      user = $(this);
      return contextmenu_button.prependTo(this).off("click").on("click", function(e) {
        var coords, id, items;
        e.preventDefault();
        e.stopPropagation();
        id = user.data("id");
        items = [
          {
            text: t_("Edit"),
            href: "/a/users/" + id + "/edit"
          }, {
            text: t_("Delete"),
            href: "/a/users/" + id + "/delete"
          }
        ];
        coords = $(this).offset();
        coords.left += $(this).innerWidth();
        return show_contextmenu(items, coords);
      });
    }
  });

}).call(this);
