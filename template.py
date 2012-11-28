# coding: utf-8
"""
Provides helper methods to template
"""
import os
import re
import pytils
import json
import datetime
import web
from web import template, ctx, storage, form
from config import config
from base import flash, auth, db
from modules.translation import _, n_
from modules import smartypants
from modules.sanitizer import sanitize
from dateutil import parser, tz

TZ_LOCAL = tz.tzlocal()
TZ_UTC = tz.tzutc()


# TODO: move this out of template
REPLACE_LINKS_RE = re.compile("href=[\"']/to/(?P<page_id>\d+)[\"']")


def replace_links_match(match):
    page_id = match.group("page_id")
    try:
        page = db.select("pages", locals(), what="path",
                         where="id=$page_id AND NOT is_deleted")[0]
        return 'href="%(path)s"' % page
    except IndexError:
        return 'href="#"'


def replace_links(input_content):
    if input_content:
        return REPLACE_LINKS_RE.sub(replace_links_match, input_content)
    else:
        return input_content

# END TODO


def datify(dtime=None, format=u"%x %H:%M", convert_to_utc=False, lang=None):
    if dtime is None:
        return ""
    if not type(dtime) in (datetime.datetime, datetime.date):
        dtime = parser.parse(dtime)
    if convert_to_utc:
        dtime = dtime.replace(tzinfo=TZ_LOCAL).astimezone(tz=TZ_UTC)
        return dtime.strftime(format)
    elif (lang or web.ctx.lang) == "ru":
        return pytils.dt.ru_strftime(
            web.safeunicode(format),
            inflected=True,
            date=dtime,
        )
    else:
        return dtime.strftime(format)


def smarty(text, lang=None):
    return smartypants.smartyPants(text, lang or web.ctx.lang)


def asset_url(filename="", version=True):
    """Returns link to static file"""
    if filename.startswith("http") or filename.startswith("/"):
        return filename
    else:
        if config.static_url:
            return_url = "http://" + config.static_url
        else:
            return_url = web.ctx.home + "/static"
        if filename:
            return_url += "/" + filename
            if version:
                return_url += "?" + config.asset_version
        return return_url


def link_to(obj_type, obj=None, method=None, **kw):
    link = "/a/" + obj_type
    if obj is not None:
        link += "/" + str(obj.get("id"))
    if method:
        link += "/" + method

    # Remove none values from kw
    params = dict((k, v) for k, v in kw.iteritems() if v is not None)
    return web.url(link, **params)


def render_block(block):
    return render_partial.blocks.block(
        block,
        getattr(render_partial.blocks, block.template)(block)
    )


def render_template_block(block_name):
    return render_partial.blocks.template_block(block_name)


def render_blocks(blocks):
    return render_partial.blocks.blocks(blocks)


def filesize(doc):
    return unicode((doc.filesize or 0) / 1024) + u" " + _("kb")


def describe_extension(doc):
    if doc.filetype == "image":
        return _("Images")
    elif doc.filetype == "folder":
        return _("Folders")
    elif doc.extension in (".txt|.rtf|.rtf|.doc|.docx|.odt|"
                           ".odc|.odp|.pdf|.ppt|.xls|.xlsx"):
        return _("Documents")
    elif doc.extension in ".zip|.rar|.tar|.gz|.bz|.tgz|.arj|.7z":
        return _("Archives")
    else:
        return _("Files")


template_globals = {
    'link_to': link_to,
    'flash': flash,
    'asset_url': asset_url,
    'auth': auth,
    'config': config,
    'datify': datify,
    'get_plural': pytils.numeral.get_plural,
    'choose_plural': pytils.numeral.choose_plural,
    'sanitize': sanitize,
    'smarty': smarty,
    'str': unicode,
    'to_json': json.dumps,
    'ctx': ctx,
    '_': _,
    'n_': n_,
    'render_block': render_block,
    'render_template_block': render_template_block,
    'render_blocks': render_blocks,
    'describe_extension': describe_extension,
    'replace_links': replace_links,
    'filesize': filesize,
    'url': web.url,
    'changequery': web.changequery,
}

render_partial = template.render(config.template_dir, globals=template_globals)
render = template.render(config.template_dir, globals=template_globals,
                         base="layout")
render_email = template.render(config.template_dir + "/email",
                               globals=template_globals, base="layout")
template_globals.update(render=render_partial)
