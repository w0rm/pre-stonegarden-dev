#
#  Users list
#
$(document).on "mouseenter", ".ui-user", (e) ->
  e.stopPropagation()
  unless contextmenu_button.parent().is(this)
    user = $(this)
    contextmenu_button
    .prependTo(this)
    .off("click")
    .on("click", (e) ->
      e.preventDefault()
      e.stopPropagation()
      id = user.data("id")
      items = [
        text: t_("Edit")
        href: "/a/users/#{id}/edit"
      ,
        text: t_("Delete")
        href: "/a/users/#{id}/delete"
      ]
      coords = $(this).offset()
      coords.left += $(this).innerWidth()
      show_contextmenu items, coords
    )

    