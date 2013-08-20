# coding: utf-8

import web
import datetime
from base import db, auth, flash
from modules.translation import N_, _, load_translation
from template import render, render_partial
from config import config
from modules.form import *
import json


class Config:

    @auth.restrict("admin", "editor", "user")
    def GET(self):
        web.header("Content-Type", "text/javascript; charset=utf-8")
        conf = dict(
            (i, config[i]) for i in ("image", "labels", "css_classes")
        )
        conf["tinymce_valid_elements"] = (
            config.sanitizer["tinymce_valid_elements"])
        if auth.get_user():
            conf["role"] = auth.get_user().role
        else:
            conf["role"] = None
        try:
            i18n = load_translation(config.default_locale)._catalog
        except:
            i18n = {}

        return render_partial.site.config(
            json.dumps(
                {"config": conf, "i18n": i18n},
                sort_keys=True,
                indent=2)
        )
