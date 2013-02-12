# coding: utf-8

import web
import datetime
import StringIO
import tarfile
import urllib2
from BeautifulSoup import BeautifulSoup
import os
from base import db, auth, flash
from modules.translation import N_, _
from template import render_partial
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
                    link['class'] = link['class'] + " external"

    return soup, files


class Export:

    @auth.restrict("admin", "editor")
    def GET(self):

        catalogPages = db.select(
            "pages",
            what="path",
            where="`type` IN $types AND NOT is_deleted " +
                  #"AND path = $path " +
                  page_where(with_auth_check=False),
            vars={
                "types": EXPORT_PAGE_TYPES,
                #"path": "/catalog/microelectronics/diodyi/2d136a91"
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
            # Add static files to archive
            all_files += files

        # Add static files to set
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
        return (u"<p><a href=\"/static/static.tar\">Теперь скачайте "
                u"статическую версию сайта по этой ссылке</a></p>")
