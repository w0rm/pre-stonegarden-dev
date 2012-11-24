urls=(

    # Application
    "/a/config.js", "controllers.application.Config",

    # Users
    "/a/users", "controllers.users.Users",
    "/a/users/new", "controllers.users.NewUser",
    "/a/users/(\d+)/edit", "controllers.users.EditUser",
    "/a/users/(\d+)/(delete|undelete)", "controllers.users.DeleteUser",

    # Auth
    "/login", "controllers.auth.Login",
    "/logout", "controllers.auth.Logout",
    "/password_reset", "controllers.auth.ResetToken",
    "/password_reset/(?P<uid>[0-9]+)\$(?P<token>[0-9a-z\$\.]+)$", "controllers.auth.ResetChange",

    # Documents
    "/a/storage", "controllers.documents.GetDocuments",
    "/uploads/(.*)", "controllers.documents.DownloadDocument",

    "/a/documents/upload", "controllers.documents.DropUploadDocument",
    "/a/documents/newfolder", "controllers.documents.NewFolderDocument",
    "/a/documents/(\d+)(/|\.json)?", "controllers.documents.GetDocument",
    "/a/documents/(\d+)/image_size", "controllers.documents.GetImageSize",
    "/a/documents/(\d+)/order", "controllers.documents.OrderDocument",
    "/a/documents/(\d+)/edit_settings", "controllers.documents.EditDocumentSettings",
    "/a/documents/(\d+)/delete", "controllers.documents.DeleteDocument",

    # Blocks
    r'/a/blocks(?:/(?P<resource_id>[0-9]+))?', "controllers.blocks.Blocks",

    # Pages
    "/a/sitemap", "controllers.pages.Sitemap",
    "/a/pages/new", "controllers.pages.NewPage",
    "/a/pages/(\d+)/edit", "controllers.pages.EditPage",
    "/a/pages/(\d+)/edit_code", "controllers.pages.EditPageCode",
    "/a/pages/(\d+)", "controllers.pages.PageTree",
    "/a/pages/(\d+)\.json", "controllers.pages.PageInfo",
    "/a/pages/(\d+)/delete", "controllers.pages.DeletePage",
    "/to/(\d+)", "controllers.pages.ToPage",
    "(.*)", "controllers.pages.ViewPage",
)
