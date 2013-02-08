# coding: utf-8

import web
import datetime
from base import db, auth, flash
from modules.translation import N_, _
from template import render_partial
from config import config
from models.news import *


class Feed:

    def GET(self):
        news = get_recent_news(10)
        web.header("Content-Type", "application/xml; charset=utf-8")
        return render_partial.site.newsfeed(news)
