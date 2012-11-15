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
        js_config = dict(
            (i, config[i]) for i in (
                "page_blocks",
                "container_blocks",
                "content_blocks",
                "containers",
                "image",
                "labels",
            )
        )
        js_config["tinymce_valid_elements"] = config.sanitizer["tinymce_valid_elements"]
        if auth.get_user():
            js_config["role"] = auth.get_user().role
        else:
            js_config["role"] = None
        js_code = "var config = %s," % json.dumps(js_config)
        try:
            return js_code + "\ni18n = %s;" % json.dumps(
                load_translation(config.default_locale)._catalog)
        except:
            return js_code + "\ni18n = {};"
