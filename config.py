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
    user_roles=["admin", "editor", "user"],
    page_blocks=["page", "subpage"],
    container_blocks=[
        "cols_33_33_33",
        "cols_25_50_25",
        "cols_50_50",
        "cols_67_33",
        "cols_33_67",
    ],
    content_blocks=[
        "richtext",
        "htmlcode",
        "navigation",
        "subnavigation",
        "siblingsnavigation",
        "breadcrumbs",
    ],
    containers=dict(
        page=["primary"],
        subpage=["primary", "secondary1"],
        cols_50_50=["primary", "secondary1"],
        cols_67_33=["primary", "secondary1"],
        cols_33_67=["primary", "secondary1"],
        cols_33_33_33=["primary", "secondary1", "secondary2"],
        cols_25_50_25=["primary", "secondary1", "secondary2"],
    ),
    image={
        # dst_width, dst_height, crop, sharp, watermark, quality, progressive
        "o": [None, None, False, False, False, 90, 0],
        "t": [160, 160, False, True, False, 90, 0],
        "s": [400, 400, False, True, False, 90, 0],
        "m": [700, 700, False, True, False, 90, 0],
        "l": [1000, 1000, False, True, False, 90, 0],
    },
    labels=dict(
        # User Roles
        admin=N_("Administrator"),
        editor=N_("Editor"),
        user=N_("User"),
        # Blocks
        page=N_("Main page"),
        subpage=N_("Inner page"),
        cols_50_50=N_("50% + 50%"),
        cols_67_33=N_("67% + 33%"),
        cols_33_67=N_("33% + 67%"),
        cols_33_33_33=N_("33% + 33% + 33%"),
        cols_25_50_25=N_("25% + 50% + 25%"),
        htmlcode=N_("HTML code"),
        richtext=N_("Rich text"),
        navigation=N_("Navigation"),
        subnavigation=N_("Subnavigation"),
        siblingsnavigation=N_("Siblings navigation"),
        breadcrumbs=N_("Breadcrumbs"),
        # Containers
        primary=N_("Main column"),
        secondary1=N_("Secondary column 1"),
        secondary2=N_("Secondary column 2"),
        secondary3=N_("Secondary column 3"),
        global_header=N_("Site header"),
        global_footer=N_("Site footer"),
        subpage_header=N_("Subpage header"),
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
