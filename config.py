# coding: utf-8
"""
This file is for configuration storage
To override configurations, simply create siteconfig.py file,
and define your overrides in "config" dictionary
"""

import os
import time
import web

N_ = lambda x: x

config = web.storage(
    environment="development",
    default_locale="en",
    timezone="Europe/Moscow",
    analytics="",
    static_url="",
    asset_version="v00",
    database_url="mysql://",  # should be set in siteconfig.py
    email={
        "email_from": "user@example.com",
        "smtp_server": "smtp.example.com",
        "smtp_port": 587,
        "smtp_username": "user@example.com",
        "smtp_password": "",
        "smtp_starttls": True,
    },
    reserved=[
        "a",
        "to",
        "login",
        "logout",
        "password_reset",
        "uploads",
    ],
    user_roles=["admin"],  # "editor", "user"
    page_types=dict(
        # Page constructors
        page={
            "block": {
                "template": "page",
                "is_system": True
            }
        },
        catalog={
            "block": {
                "template": "page",
                "is_system": True,
                "blocks": [{
                    "template": "row",
                    "is_system": True,
                    "blocks": [
                        {
                            "template": "column",
                            "size": 8,
                            "is_system": True,
                            "blocks": [
                                {
                                    "template": "page_title",
                                    "is_system": True
                                },
                                {
                                    "template": "categories",
                                    "is_system": True
                                }
                            ]
                        },
                        {
                            "template": "column",
                            "is_system": True,
                            "size": 4
                        }
                    ]
                }]
            }
        },
        category={
            "block": {
                "template": "page",
                "is_system": True,
                "blocks": [
                    {
                        "template": "nav",
                        "type": "breadcrumbs",
                        "is_system": True
                    },
                    {
                        "template": "page_title",
                        "is_system": True
                    },
                    {
                        "template": "subcategories_nav",
                        "is_system": True
                    },
                    {
                        "template": "row",
                        "is_system": True,
                        "blocks": [
                            {
                                "template": "column",
                                "size": 8,
                                "is_system": True,
                                "blocks": [{
                                    "template": "products",
                                    "is_system": True
                                }]
                            },
                            {
                                "template": "column",
                                "is_system": True,
                                "size": 4
                            }
                        ]
                    }
                ]
            }
        },
        product={
            "block": {
                "template": "page",
                "is_system": True,
                "blocks": [
                    {
                        "template": "nav",
                        "type": "breadcrumbs",
                        "is_system": True
                    },
                    {
                        "template": "page_title",
                        "is_system": True
                    }
                ]
            }
        }
    ),
    image={
        # dst_width, dst_height, crop, sharp, watermark, quality, progressive
        "o": [None, None, False, False, False, 90, 0],
        "t": [160, 160, False, True, False, 90, 0],
        "s": [400, 400, False, True, False, 80, 0],
        "m": [800, 800, False, True, False, 75, 0],
        "l": [1200, 1200, False, True, False, 70, 0],
    },
    nav_types=["root", "children", "siblings", "breadcrumbs"],
    labels=dict(
        # User Roles
        admin=N_("Administrator"),
        editor=N_("Editor"),
        user=N_("User"),
        # Page blocks
        page=N_("Page"),
        # Content blocks
        html=N_("HTML code"),
        wysiwyg=N_("Rich text"),
        # Navigation blocks
        root=N_("Navigation"),
        children=N_("Subnavigation"),
        siblings=N_("Siblings navigation"),
        breadcrumbs=N_("Breadcrumbs"),
        # Template block names
        global_header=N_("Site header"),
        global_footer=N_("Site footer"),
        # Image sizes
        o=N_("Original"),
        t=N_("Thumbnail"),
        s=N_("Small"),
        m=N_("Medium"),
        l=N_("Large"),
    ),
    sanitizer=dict(
        allowed_attributes={
            "*": ["class", "id", "title"],  # common for all elements
            "a": [
                "coords",
                "href",
                "name",
                "rel",
                "rev",
                "tabindex",
                "target",
            ],
            "acronym": [],
            "address": [],
            "blockquote": ["cite"],
            "br": [],
            "caption": [],
            "cite": [],
            "code": [],
            "col": ["span", "valign", "width"],
            "colgroup": ["span", "valign", "width"],
            "dd": [],
            "del": ["cite", "datetime"],
            "dfn": [],
            "dl": ["compact"],
            "dt": [],
            "em": [],
            "i": [],
            "h1": [],
            "h2": [],
            "h3": [],
            "h4": [],
            "h5": [],
            "h6": [],
            "hr": ["noshade"],
            "img": [
                "align",
                "alt",
                "border",
                "height",
                "hspace",
                "ismap",
                "longdesc",
                "name",
                "src",
                "vspace",
                "width",
            ],
            "ins": ["cite", "datetime"],
            "legend": [],
            "li": ["type"],
            "object": [
                "align",
                "archive",
                "border",
                "classid",
                "codebase",
                "codetype",
                "data",
                "declare",
                "height",
                "hspace",
                "name",
                "standby",
                "style",
                "tabindex",
                "type",
                "usemap",
                "vspace",
                "width",
            ],
            "ol": ["compact", "start", "type"],
            "p": ["align"],
            "pre": ["align", "width"],
            "q": ["cite"],
            "small": [],
            "span": [],
            "strike": [],
            "s": [],
            "strong": [],
            "b": [],
            "sub": [],
            "sup": [],
            "table": [
                "bgcolor",
                "border",
                "cellpadding",
                "cellspacing",
                "height",
                "summary",
                "width",
            ],
            "tbody": ["valign"],
            "td": [
                "abbr",
                "axis",
                "bgcolor",
                "colspan",
                "headers",
                "height",
                "nowrap",
                "rowspan",
                "scope",
                "valign",
                "width",
            ],
            "tfoot": ["valign"],
            "th": [
                "abbr",
                "align",
                "axis",
                "bgcolor",
                "colspan",
                "headers",
                "height",
                "nowrap",
                "rowspan",
                "scope",
                "valign",
                "width",
            ],
            "thead": ["align"],
            "tr": ["bgcolor", "rowspan", "valign"],
            "ul": ["compact", "type"],
        },
        element_replacements={
            "em": ["i"],
            "strong": ["b"],
            "strike": ["s"],
        }
    )
)

try:
    import siteconfig
    config.update(siteconfig.config)
except ImportError:
    pass

# Set timezone
os.environ["TZ"] = config.timezone
time.tzset()


def tinymce_sanitizer(s):
    s["allowed_elements"] = s["allowed_attributes"].keys()
    s["allowed_elements"].remove("*")
    s["replacements"] = dict()
    for k, v in s["element_replacements"].items():
        for e in v:
            s["replacements"][e] = k
    s["tinymce_valid_elements"] = ",".join(
        ["@[%s]" % "|".join(s["allowed_attributes"].get("*", []))] + [
            "%s[%s]" % (
                "/".join([el] + s["element_replacements"].get(el, [])),
                "|".join(s["allowed_attributes"].get(el, []))
            )
            for el in s["allowed_elements"]]
    ).replace("[]", "")
    return s

config.sanitizer = tinymce_sanitizer(config.sanitizer)

# Set directories
config.rootdir = os.path.abspath(os.path.dirname(__file__))
config.update(
    static_dir=config.rootdir + "/static",
    upload_dir=config.rootdir + "/upload",
    template_dir=config.rootdir + "/templates/html",
    locale_dir=config.rootdir + "/i18n",
)

# Email settings
web.config.update(config.email)

# Update config based on current environment
if os.environ.get('WEBPY_ENV') == 'test':
    config.environment = "test"

if config.environment == "test":
    config.sendmail = False
    web.config.debug = False
    web.config.debug_sql = False
else:
    web.config.session_parameters.update(
        cookie_name="tasty_cookie",
    )
    if config.environment == "development":
        config.sendmail = False
        web.config.debug = True
        web.config.debug_sql = True
    elif config.environment == "production":
        config.sendmail = True
        web.config.debug = False
        web.config.debug_sql = False
