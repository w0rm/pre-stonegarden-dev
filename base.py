# coding: utf-8
"""
This file initializes core objects, provides a function
to create application and stuff it with application processors
"""

import web
from config import config
from urls import urls
from modules.flash import Flash
from modules.dbauth import DBAuth, DBUserStore
from modules.mailer import Mailer
from modules.logger import Logger
from modules.application import Application

# Core objects:
db = web.database(**config.database)
flash = Flash()
auth = DBAuth(db, flash)
mailer = Mailer(db, config.sendmail)
applog = Logger(db, auth)


def load_hook():
    web.ctx.lang = config.default_locale
    web.ctx.session = web.config._session
    try:
        # Sets timezone for mysql database
        db.query('SET time_zone = $timezone;', vars=config)
    except:
        pass


def create_application():
    '''Initializes web.py application'''
    app = Application(urls, globals())
    # Session initialization
    if web.config.get('_session') is None:
        # this is required to work with reloader
        web.config._session = web.session.Session(
            app,
            DBUserStore(db, 'sessions'),
            dict(forms=dict(), venues=0, is_searching=False, search=None),
        )
    app.add_processor(web.loadhook(load_hook))
    return app
