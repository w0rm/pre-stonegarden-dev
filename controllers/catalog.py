# coding: utf-8

import web
import datetime
import StringIO
import tarfile
import urllib2
from bs4 import BeautifulSoup
import os
import time
from base import db, auth, flash
from modules.translation import N_, _
from template import render
from config import config
from models.pages import *


EXPORT_PAGE_TYPES = ["catalog", "category", "product"]

STATIC_INCLUDES = """fonts
img
vendor/js/foundation
vendor/js/jquery-1.8.1.js
vendor/js/require-2.1.1.js
css/style.css
js/plugins
js/public_main.js""".split()

PATCH_ATTRIBUTES = ["src", "href", "data-main", "data-m_src", "data-l_src"]
INCLUDE_STATIC = ["src", "data-m_src", "data-l_src"]


def add_string(tar, string, name):
    data = StringIO.StringIO(string)
    data.seek(0)
    info = tarfile.TarInfo(name=name)
    info.size = len(data.buf)
    tar.addfile(tarinfo=info, fileobj=data)


def trim_querystring(path):
    q = path.rfind("?")
    if q >= 0:
        return path[0:q]
    else:
        return path


def substract_root(path, root):
    if path.startswith(root):
        return path[len(root):]
    else:
        return path


def format_soup(soup, path):
    newpath = substract_root(path, "/catalog") + "/"
    files = []

    for attr in PATCH_ATTRIBUTES:
        for link in soup.findAll(**{attr: True}):
            href = link[attr]
            if href.startswith("/static"):
                link[attr] = os.path.relpath(href, newpath)
                if attr in INCLUDE_STATIC:
                    files.append(trim_querystring(
                        substract_root(href, "/static/")
                    ))
            elif href.startswith("/catalog"):
                link[attr] = os.path.relpath(href, newpath) + ".html"
            elif not href.startswith("http://"):
                link[attr] = web.ctx.home + link[attr]
                if link.name == "a":
                    link['class'] = link.get('class', []) + ["external"]
                    link['target'] = "_blank"
                    link['title'] = _("Link opens in new window")

    return soup, files


class Export:

    @auth.restrict("admin", "editor")
    def GET(self):
        export_time = datetime.datetime.fromtimestamp(
            os.path.getctime(config.rootdir + "/static/static.tar")
        )
        return render.catalog.export(export_time)

    @auth.restrict("admin", "editor")
    def POST(self):

        catalogPages = db.select(
            "pages",
            what="path",
            where="`type` IN $types AND NOT is_deleted " +
                  page_where(with_auth_check=False,
                             with_published_check=True),
            vars={
                "types": EXPORT_PAGE_TYPES,
            }
        )

        try:
            os.unlink(config.rootdir + "/static/static.tar")
        except:
            pass

        tar = tarfile.open(config.rootdir + "/static/static.tar", "w")
        all_files = []

        for p in catalogPages:
            html = urllib2.urlopen(web.ctx.home + p.path).read()
            soup = BeautifulSoup(html)
            soup, files = format_soup(soup, p.path)
            # Add html page to archive
            add_string(tar, str(soup), p.path + ".html")
            # Add static files to list
            all_files += files

        # Add static files to list
        for name in STATIC_INCLUDES:
            sys_path = config.rootdir + "/static/" + name
            if os.path.isdir(sys_path):
                for root, dirnames, filenames in os.walk(sys_path):
                    for filename in filenames:
                        all_files.append(
                            substract_root(
                                root + "/" + filename,
                                config.rootdir + "/static/"
                            )
                        )
            else:
                all_files.append(name)

        all_files = set(all_files)
        # Add static files to archive
        for name in all_files:
            try:
                tar_path = "static/" + name
                sys_path = config.rootdir + "/" + tar_path
                tar.add(sys_path, tar_path)
            except:
                raise

        tar.close()
        raise web.seeother("/a/catalog/export")
