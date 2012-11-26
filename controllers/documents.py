# coding: utf-8
import web
from base import auth
from template import link_to, image_url, render
from modules.form import ApiForm, notnull
from modules.restful_controller import RESTfulController
from modules.translation import N_
from models.documents import *


class Storage:

    @auth.restrict("admin", "editor", "user")
    def GET(self):
        return render.documents.storage()


class Download:

    def GET(self, filename):
        document = get_document_by_filename()
        return download_document(document)


class Documents(RESTfulController):

    form = ApiForm(
        web.form.Input("parent_id", notnull),
        web.form.Input("position", notnull),
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

    @auth.restrict("admin", "editor", "user")
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

    @auth.restrict("admin", "editor", "user")
    def get(self, document_id):
        document = get_document_by_id(document_id)
        web.header("Content-Type", "application/json")
        return document_to_json(document)

    @auth.restrict("admin", "editor")
    def update(self, document_id):
        form = self.form()
        if form.validates():
            document = update_document_by_id(document_id, form.d)
            raise web.seeother(link_to("documents", document))
        raise form.validation_error()

    @auth.restrict("admin", "editor")
    def delete(self, document_id):
        delete_document_by_id(block_id)
        web.header("Content-Type", "application/json")
        return '{"status": 1}'


#TODO: Better api for image resize
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
