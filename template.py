# coding: utf-8
"""
Provides helper methods to template
"""
import os
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
            return_url = "/static"  # web.ctx.home + "/static"
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
    'to_json': json.dumps,
    'ctx': ctx,
    '_': _,
    'n_': n_,
    'url': web.url,
    'changequery': web.changequery,
}


class template_global(object):
    """Registers func for use in templates"""

    def __init__(self, f):
        name = f.__name__
        #if name in template_globals:
        #    raise Exception("Name already registered: %s" % name)
        #else:
        template_globals[name] = f
        self.f = f

    def __call__(self, *k, **kw):
        return self.f(*k, **kw)


render_partial = template.render(config.template_dir, globals=template_globals)
render = template.render(config.template_dir, globals=template_globals,
                         base="layout")
render_email = template.render(config.template_dir + "/email",
                               globals=template_globals, base="layout")
template_globals.update(render=render_partial)
