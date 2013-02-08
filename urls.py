urls = (

    # ======================
    # Application
    # ======================
    # TODO: serve compiled config.js
    "/a/config.js", "controllers.application.Config",

    # ======================
    # News
    # ======================
    "/newsfeed.rss", "controllers.news.Feed",

    # ======================
    # Users
    # ======================

    # TODO: restful api for users
    "/a/users", "controllers.users.Users",
    "/a/users/new", "controllers.users.NewUser",
    "/a/users/(\d+)/edit", "controllers.users.EditUser",
    "/a/users/(\d+)/(delete|undelete)", "controllers.users.DeleteUser",

    # ======================
    # Authentication
    # ======================

    "/login", "controllers.auth.Login",
    "/logout", "controllers.auth.Logout",
    # password reset form
    "/password_reset", "controllers.auth.ResetToken",
    # password change:
    r'/password_reset/(?P<uid>[0-9]+)\$(?P<token>[0-9a-z\$\.]+)$',
    "controllers.auth.ResetChange",

    # ======================
    # Documents
    # ======================

    # storage page
    "/a/storage(?:/[0-9]+)?", "controllers.documents.Storage",

    # document download with access control
    "/uploads/(.*)", "controllers.documents.Download",

    # documents restfull controller
    r'/a/documents(?:/(?P<resource_id>[0-9]+))?',
    "controllers.documents.Documents",

    # api to get image size
    "/a/documents/(\d+)/image_size", "controllers.documents.GetImageSize",

    # ======================
    # Blocks
    # ======================

    # blocks restfull controller
    r'/a/blocks(?:/(?P<resource_id>[0-9]+))?', "controllers.blocks.Blocks",

    # ======================
    # Pages
    # ======================

    # Link list in TinyMCE
    "/a/tinymce_link_list.js", "controllers.pages.TinyMCELinkList",

    # sitemap
    "/a/sitemap", "controllers.pages.Sitemap",

    # pages restfull controller
    r'/a/pages(?:/(?P<resource_id>[0-9]+))?', "controllers.pages.Pages",

    #"/a/pages/new", "controllers.pages.NewPage",
    #"/a/pages/(\d+)/edit", "controllers.pages.EditPage",
    #"/a/pages/(\d+)/edit_code", "controllers.pages.EditPageCode",
    #"/a/pages/(\d+)", "controllers.pages.PageTree",
    #"/a/pages/(\d+)\.json", "controllers.pages.PageInfo",
    #"/a/pages/(\d+)/delete", "controllers.pages.DeletePage",

    # redirect to page by id
    "/to/(\d+)", "controllers.pages.ToPage",

    # view page by path
    "(.*)", "controllers.pages.ViewPage",

)
