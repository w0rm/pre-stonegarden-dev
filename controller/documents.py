# coding: utf-8

import web
import os
import datetime
import json
import urllib
from config import config
from base import db, auth, flash
from modules.utils import dthandler
from modules.translation import _, N_
from template import render, render_partial, link_to, image_url
from modules.form import *
from web import ctx
from pytils.translit import slugify
import random
import string
import mimetypes

document_download_forbidden = N_("Cannot download this document")

documentSettingsForm = web.form.Form(
    Textbox("title"),
    Textarea("content"),
    Checkbox("is_published", description=N_("Show on site"), value="ok"),
)


def document_download_access(func):  # defines who can download file
    def proxyfunc(iself, *args, **kw):
        document = args[0]
        if auth.has_role("admin", "editor", "user") or document.is_published:
            return func(iself, *args, **kw)
        else:
            raise flash.redirect(document_download_forbidden)
    return proxyfunc


def download_document(document):
    web.header("Content-Disposition", "attachment; filename=%s" %
               slugify(document.title) + document.extension)
    web.header("Content-Type", document.mimetype)
    #web.header('Transfer-Encoding', 'chunked')
    f = open(os.path.join(config.upload_dir, document.filename), 'rb')
    while 1:
        buf = f.read(1024 * 8)
        if not buf:
            break
        yield buf


def rem_file(filename):
    if os.path.exists(filename):
        os.unlink(filename)


def delete_file(filename):
    rem_file(os.path.join(config.upload_dir, filename + ".jpg"))
    rem_file(os.path.join(config.upload_dir, filename + "_tmp.jpg"))
    for size in config.image.keys():
        rem_file(os.path.join(config.static_dir, filename +
                              "_" + size + ".jpg"))


def delete_document(document):
    db.update("documents", where="id = $id AND NOT is_deleted",
              vars=document, is_deleted=1)
    if document.filetype == "folder":
        for doc in db.select("documents", document,
                             where="document_id=$id AND NOT is_deleted"):
            delete_document(doc)


def save_document(f):
    """Saves file and returns filename with path from upload folder"""
    prefix = datetime.datetime.now().strftime("%Y/%m")
    prefixname = None
    while prefixname is None or os.path.exists(
            os.path.join(config.upload_dir, prefix, prefixname)):
        prefixname = (
            os.path.join(
                prefix,
                ''.join(random.choice(string.ascii_letters + string.digits)
                        for x in range(5))
            )
        )

    folder = os.path.join(config.upload_dir, prefix)
    if not os.path.exists(folder):
        os.makedirs(folder)
    document_file = file(os.path.join(config.upload_dir, prefixname), 'w')

    while 1:
        buf = f.read(1024 * 8)
        if not buf:
            break
        document_file.write(buf)
    size = document_file.tell()
    document_file.close()
    return prefixname, size


class DropUploadDocument:

    @auth.restrict("admin", "editor")
    def POST(self):
        get = web.input(document_id=1, obj_id=None, obj_type=None,
                        image_size="t", filename=None, upload=None)
        folder = db.select("documents", get, where="id = $document_id",
                           limit=1)[0]
        web.header("Content-Type", "application/json")
        i = web.webapi.rawinput()
        try:
            files = i.files
            if not isinstance(files, list):
                files = [files]
            for f in files:
                if f.filename:
                    filetype, encoding = mimetypes.guess_type(f.filename)
                    with db.transaction():
                        filename, filesize = save_document(f.file)

                        position = db.select(
                            "documents",
                            folder,
                            where='document_id = $id AND NOT '
                                  'filetype = "folder" AND NOT is_deleted',
                            what='MAX(position)+1 as n',
                        )[0].n

                        file_id = db.insert(
                            "documents",
                            document_id=folder.id,
                            position=position or 1,
                            filename=filename,
                            documents=(folder.documents + "," + str(folder.id)
                                       if folder.documents else folder.id),
                            level=folder.level + 1,
                            created_at=datetime.datetime.now(),
                            title=get.filename or os.path.splitext(
                            f.filename)[0],
                            extension=os.path.splitext(f.filename)[1].lower(),
                            mimetype=filetype,
                            filetype=("image" if "image" in
                                      filetype else "document"),
                            filesize=filesize,
                            is_published=True,
                        )

                    if get.upload == "image":
                        if "image" in filetype:
                            raise web.seeother(
                                web.url(
                                    "/a/documents/%d/image_size" % file_id,
                                    size=get.image_size))
                        raise web.HTTPError('400 Bad Request', dict(),
                                            json.dumps(dict(status=0)))

                    if get.obj_type in ("contacts", "buildings"):
                        if "image" in filetype:
                            db.update(get.obj_type, where="id=$obj_id",
                                      vars=get, photo_id=file_id)
                            raise web.seeother(
                                web.url(
                                    "/a/documents/%d/image_size" % file_id,
                                    size=get.image_size))
                        raise web.HTTPError('400 Bad Request', dict(),
                                            json.dumps(dict(status=0)))
            raise web.seeother(link_to("documents", folder) + ".json")
        except KeyError:
            pass
        raise web.HTTPError('400 Bad Request', dict(),
                            json.dumps(dict(status=0)))


class NewFolderDocument:

    @auth.restrict("admin", "editor")
    def POST(self):
        get = web.input(document_id=1, title=None)
        folder = db.select("documents", get, where="id = $document_id",
                           limit=1)[0]
        web.header("Content-Type", "application/json")
        with db.transaction():
            document = web.storage(
                document_id=get.document_id,
                documents=(folder.documents + "," + str(folder.id)
                           if folder.documents else folder.id),
                level=folder.level + 1,
                created_at=datetime.datetime.now(),
                title=get.title,
                filetype="folder",
                is_published=True,
            )
            document.id = db.insert("documents", **document)
        raise web.seeother(link_to("documents", document) + ".json")


class DownloadDocument:

    def GET(self, filename):
        document = db.select(
            "documents",
            locals(),
            where="filename = $filename AND NOT is_deleted",
            limit=1)[0]
        return self.download(document)

    @document_download_access
    def download(self, document):
        return download_document(document)


class GetDocument(object):

    @auth.restrict("admin", "editor", "user")
    def GET(self, document_id, format=None):
        document = db.select(
            "documents",
            locals(),
            where="id = $document_id AND NOT is_deleted",
            limit=1)[0]
        if format == ".json":
            web.header("Content-Type", "application/json")
            document.html = unicode(render_partial.ui.document(document))
            return json.dumps(document, default=dthandler)

        document.path = db.select(
            "documents",
            where="id in (%s) AND NOT is_deleted" % document.documents,
        ).list() if document.level > 0 else []

        if document.filetype == "folder":
            document.folders = db.select(
                "documents",
                locals(),
                where="document_id = $document_id AND "
                      "filetype = 'folder' AND NOT is_deleted",
                order="title",
            ).list()
            if "filter" in web.input():
                document.documents = db.select(
                    "documents",
                    locals(),
                    where="document_id = $document_id AND NOT filetype IN"
                          " ('folder','document') AND NOT is_deleted",
                    order="position").list()
            else:
                document.documents = db.select(
                    "documents",
                    locals(),
                    where="document_id = $document_id AND NOT "
                          "filetype = 'folder' AND NOT is_deleted",
                    order="position").list()
            if web.ctx.env.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest':
                return render_partial.ui.documents(document)
            else:
                return render.documents.list(document)
        else:
            # download document
            return download_document(document)


class GetImageSize:

    @auth.restrict("admin", "editor", "user")
    def GET(self, document_id):
        document = db.select(
            "documents",
            locals(),
            where="id = $document_id AND NOT is_deleted",
            limit=1)[0]
        size = web.input(size="_").size
        if not size in config.image:
            size = "_"
        src = image_url(document.id, document.filename,
                        document.extension, document.sizes, size)
        if web.ctx.env.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest':
            web.header("Content-Type", "application/json")
            return json.dumps(dict(src=src, id=document.id,
                                   title=document.title))
        else:
            raise web.seeother(src)


class GetDocuments(GetDocument):

    path = "/a/documents/?"

    def GET(self):
        return super(self.__class__, self).GET(1)


class OrderDocument:

    @auth.restrict("admin", "editor")
    def POST(self, document_id):

        document = db.select(
            "documents",
            locals(),
            where="id = $document_id AND NOT is_deleted",
            limit=1)[0]
        document.position_new = int(web.input(position=None).position)

        with db.transaction():
            if document.position_new < int(document.position):
                db.update(
                    "documents",
                    where="document_id = $document_id AND position >= "
                          "$position_new AND position < $position AND "
                          "NOT is_deleted AND NOT filetype = 'folder' ",
                    vars=document,
                    position=web.db.SQLLiteral("position+1"),
                )
            if document.position_new > int(document.position):
                db.update(
                    "documents",
                    where="document_id = $document_id AND position > "
                          "$position AND position <= $position_new AND "
                          "NOT is_deleted AND NOT filetype = 'folder'",
                    vars=document,
                    position=web.db.SQLLiteral("position-1"),
                )
            db.update("documents", where="id = $id", vars=document,
                      position=document.position_new)

        if web.ctx.env.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest':
            web.header("Content-Type", "application/json")
            return json.dumps(dict(status=1))
        else:
            raise web.seeother(web.ctx.env.get('HTTP_REFERER', '/'))


class EditDocumentSettings:

    @auth.restrict("admin", "editor")
    def POST(self, document_id):
        # page_id should be set
        document = db.select(
            "documents",
            locals(),
            where="$document_id = id AND NOT is_deleted",
            limit=1)[0]
        if document.is_system:
            # cannot edit or delete system files and folders
            raise flash.error(
                _("Cannot edit or delete system files and folders."))
        document_form = documentSettingsForm(web.input())
        if document_form.valid:
            db.update(
                "documents",
                where="$document_id = id",
                vars=locals(),
                updated_at=datetime.datetime.now(),
                **document_form.d)
            raise web.seeother(link_to("documents", document) + ".json")
        return "NOT OK"


class DeleteDocument:

    @auth.restrict("admin", "editor")
    def POST(self, document_id):

        document = db.select(
            "documents",
            locals(),
            where="$document_id = id AND NOT is_deleted",
            limit=1)[0]

        if document.is_system:
            # cannot edit or delete system files and folders
            raise flash.error(
                _("Cannot edit or delete system files and folders."))

        # shift positions
        db.update(
            "documents",
            where="document_id = $document_id AND position > $position AND "
                  "NOT is_deleted AND NOT filetype = 'folder'",
            vars=document,
            position=web.SQLLiteral("position-1"),
        )

        # delete recursively
        delete_document(document)

        if web.ctx.env.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest':
            web.header("Content-Type", "application/json")
            return json.dumps(dict(status=1))
        else:
            raise web.seeother(web.ctx.env.get('HTTP_REFERER', '/'))
