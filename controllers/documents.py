# coding: utf-8

import web
import os
import json
import urllib
from modules.form import ApiForm, notnull
from config import config
from base import db, auth, flash
from modules.translation import _, N_
from modules.restful_controller import RESTfulController
from template import render, render_partial, link_to, image_url
from modules.form import ApiForm, notnull
from web import ctx
from pytils.translit import slugify
import random
import string
import mimetypes

document_download_forbidden = N_("Cannot download this document")


def document_download_access(func):  # defines who can download file
    def proxyfunc(iself, *args, **kw):
        document = args[0]
        if auth.has_role("admin", "editor", "user") or document.is_published:
            return func(iself, *args, **kw)
        else:
            raise flash.redirect(document_download_forbidden)
    return proxyfunc


class Storage:

    def GET(self):
        pass


class Download:

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


class Documents(RESTfulController):

    form = ApiForm(
        web.form.Input("parent_id", notnull),
        web.form.Input("title"),
        web.form.Input("type"),
        web.form.Input("description"),
        web.form.Input("is_published"),
        web.form.Input("upload"),
    )

    filter_form = ApiForm(
        web.form.Input("parent_id", notnull),
        web.form.Input("type"),
    )

    @auth.restrict("admin", "editor")
    def list(self):
        """Lists documents by specified parent_id (or type filter)"""
        form = self.filter_form()
        if form.validates():
            web.header("Content-Type", "application/json")
            query = form.d
            documents = get_documents_by_parent_id(query.parent_id,
                                                   query.type)
            return documents_to_json(documents)
        raise form.validation_error()

    @auth.restrict("admin", "editor")
    def create(self):
        d = web.input(upload={})
        form = self.form()
        if form.validates(d):
            document = create_document(form.d)
            raise web.seeother(link_to("documents", document))
        raise form.validation_error()

    @auth.restrict("admin", "editor")
    def update(self, document_id):
        d = web.input(page_id=None, sizes=[])
        form = self.form()
        if form.validates(d):
            document = update_document_by_id(document_id, form.d)
            raise web.seeother(link_to("document_ids", document))
        raise form.validation_error()

    @auth.restrict("admin", "editor")
    def delete(self, document_id):
        delete_document_by_id(block_id)
        web.header("Content-Type", "application/json")
        return '{"status": 1}'


#TODO: extract parts from the code below to models/documents.py

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
                    mimetype, encoding = mimetypes.guess_type(f.filename)
                    with db.transaction():
                        filename, filesize = save_document(f.file)

                        position = db.select(
                            "documents",
                            folder,
                            where='parent_id = $id AND NOT '
                                  'type = "folder" AND NOT is_deleted',
                            what='MAX(position)+1 as n',
                        )[0].n

                        file_id = db.insert(
                            "documents",
                            parent_id=folder.id,
                            position=position or 1,
                            filename=filename,
                            ids=(folder.ids + "," + str(folder.id)
                                 if folder.ids else folder.id),
                            level=folder.level + 1,
                            created_at=datetime.datetime.now(),
                            title=get.filename or os.path.splitext(
                            f.filename)[0],
                            extension=os.path.splitext(f.filename)[1].lower(),
                            mimetype=mimetype,
                            type=("image" if "image" in
                                  mimetype else "document"),
                            filesize=filesize,
                            is_published=True,
                        )

                    if get.upload == "image":
                        if "image" in mimetype:
                            raise web.seeother(
                                web.url(
                                    "/a/documents/%d/image_size" % file_id,
                                    size=get.image_size))
                        raise web.HTTPError('400 Bad Request', dict(),
                                            json.dumps(dict(status=0)))

                    if get.obj_type in ("contacts", "buildings"):
                        if "image" in mimetype:
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
                parent_id=get.document_id,
                ids=(folder.ids + "," + str(folder.id)
                                  if folder.ids else folder.id),
                level=folder.level + 1,
                created_at=datetime.datetime.now(),
                title=get.title,
                type="folder",
                is_published=True,
            )
            document.id = db.insert("documents", **document)
        raise web.seeother(link_to("documents", document) + ".json")


class GetDocument:

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
            where="id in (%s) AND NOT is_deleted" % document.ids,
        ).list() if document.level > 0 else []

        if document.type == "folder":
            document.folders = db.select(
                "documents",
                locals(),
                where="parent_id = $document_id AND "
                      "type = 'folder' AND NOT is_deleted",
                order="title",
            ).list()
            if "filter" in web.input():
                document.documents = db.select(
                    "documents",
                    locals(),
                    where="parent_id = $document_id AND NOT type IN"
                          " ('folder','document') AND NOT is_deleted",
                    order="position").list()
            else:
                document.documents = db.select(
                    "documents",
                    locals(),
                    where="parent_id = $document_id AND NOT "
                          "type = 'folder' AND NOT is_deleted",
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
                    where="parent_id = $document_id AND position >= "
                          "$position_new AND position < $position AND "
                          "NOT is_deleted AND NOT type = 'folder' ",
                    vars=document,
                    position=web.db.SQLLiteral("position+1"),
                )
            if document.position_new > int(document.position):
                db.update(
                    "documents",
                    where="parent_id = $document_id AND position > "
                          "$position AND position <= $position_new AND "
                          "NOT is_deleted AND NOT type = 'folder'",
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
            where="id = $document_id AND NOT is_deleted",
            limit=1)[0]
        if document.is_system:
            # cannot edit or delete system files and folders
            raise flash.error(
                _("Cannot edit or delete system files and folders."))
        document_form = documentSettingsForm(web.input())
        if document_form.valid:
            db.update(
                "documents",
                where="id = $document_id",
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
            where="id = $document_id AND NOT is_deleted",
            limit=1)[0]

        if document.is_system:
            # cannot edit or delete system files and folders
            raise flash.error(
                _("Cannot edit or delete system files and folders."))

        # shift positions
        db.update(
            "documents",
            where="parent_id = $parent_id AND position > $position AND "
                  "NOT is_deleted AND NOT type = 'folder'",
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
