# coding: utf-8

import web
import os
import datetime
import json
from config import config
from base import db, auth, flash, load_navigation
from modules.translation import _, N_
from modules.utils import dthandler
from template import render, render_partial, link_to
from modules.form import *
from pytils.translit import slugify
from models.pages import *

pageForm = Form(
    Textbox("name", notnull, description=N_("Name"), size=30, maxlength=255),
    Textbox("title", notnull, description=N_("Title"), size=30, maxlength=255,
            class_="fullwidth"),
    Dropdown("page_id", [], description=N_("Parent")),
    Textbox("slug", description=N_("Path"), size=20, maxlength=30),
    Dropdown(
        "template",
        [(k, config.labels[k]) for k in config.page_blocks],
        description=N_("Page template"),
        value="subpage",
    ),
    Checkbox("is_published", description=N_("Show on site"), value="ok"),
    Checkbox("is_navigatable", description=N_("Show in navigation"),
             value="ok", checked=True),
    Textarea("meta_description", description=N_("Description")),
    Textarea("meta_keywords", description=N_("Keywords")),
)
pageCodeForm = Form(
    Textarea("css_code", description=N_("CSS"), cols=80, rows=20),
    Textarea("js_code", description=N_("Javascript"), cols=80, rows=20),
)

page_access_forbidden_text = N_("Page access forbidden.")
page_deleted_text = N_("Page was deleted.")
cannot_delete_root_text = N_("Cannot delete root page.")


class Sitemap:

    @auth.restrict("admin", "editor", "user")
    def GET(self):
        pages = db.select("pages", where="NOT is_deleted")
        if web.ctx.env.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest':
            return render_partial.pages.sitemap(pages)
        else:
            return render.pages.sitemap(pages)


class NewPage:

    @auth.restrict("admin", "editor")
    def GET(self):
        pages = list(db.select("pages", where="NOT is_deleted",
                               order="level, id"))
        page_form = pageForm()
        page_form.page_id.args = dropdown_pages(pages[0], pages)
        page_form.page_id.value = web.input(page_id="1").page_id
        parent_page = db.select("pages", page_form.d,
                                where="id=$page_id AND NOT is_deleted")[0]
        page_form.slug.item_pre = '<span id="page_path">%s</span>' % join_path(
            parent_page.path)
        return render.pages.form(page_form)

    @auth.restrict("admin", "editor")
    def POST(self):
        page_form = pageForm(web.input())
        if page_form.valid:
            page = page_form.d
            template = page.pop("template", "page")
            page.update(unique_path(page))
            page_id = db.insert("pages",
                                created_at=datetime.datetime.now(), **page)
            db.insert(
                "blocks",
                created_at=datetime.datetime.now(),
                page_id=page_id,
                level=0,
                template=template,
                is_published=True,
            )
            raise web.seeother(page.path)
        raise web.seeother("/a/pages/new")


class EditPage:

    @auth.restrict("admin", "editor")
    def GET(self, page_id):
        page = db.select("pages", locals(),
                         where="id=$page_id AND NOT is_deleted")[0]
        page.template = db.select(
            "blocks",
            page,
            what="template",
            where="page_id=$id AND block_id IS NULL",
        )[0].template
        page_form = pageForm()
        page_form.fill(page)
        if page_id != "1":
            pages = list(db.select(
                "pages",
                locals(),
                where="NOT id = $page_id AND NOT is_deleted",
                order="level, id",
            ))
            page_form.page_id.args = dropdown_pages(pages[0], pages)
            page_form.slug.item_pre = (
                '<span id="page_path">%s</span>' %
                web.rstrips(page.path, page.slug))
        else:
            page_form.page_id.attrs["disabled"] = "disabled"
            page_form.slug.attrs["disabled"] = "disabled"
            page_form.slug.item_pre = '<span id="page_path">%s</span>' % "/"
        return render.pages.form(page_form, page)

    @auth.restrict("admin", "editor")
    def POST(self, page_id):
        page_form = pageForm(web.input())
        if page_form.valid:
            page = page_form.d
            page.update(unique_path(page, page_id))
            template = page.pop("template", "page")
            db.update("pages", where="id=$page_id", vars=locals(),
                      updated_at=datetime.datetime.now(), **page)
            db.update(
                "blocks",
                where="page_id = $page_id and level = 0",
                vars=locals(),
                updated_at=datetime.datetime.now(),
                template=template,
            )
            update_branch(page_id)
            raise web.seeother(page.path)
        else:
            raise web.seeother(link_to("pages",
                                       web.storage(id=page_id), "edit"))


class EditPageCode:

    @auth.restrict("admin", "editor")
    def GET(self, page_id):
        page = db.select("pages", locals(),
                         where="id=$page_id AND NOT is_deleted")[0]
        page_code_form = pageCodeForm()
        page_code_form.fill(page)
        return render.pages.edit_code(page_code_form, page)

    @auth.restrict("admin", "editor")
    def POST(self, page_id):
        page_code_form = pageCodeForm(web.input())
        if page_code_form.valid:
            page = page_code_form.d
            db.update("pages", where="id=$page_id", vars=locals(),
                      updated_at=datetime.datetime.now(), **page)
            page = db.select("pages", locals(),
                             where="id=$page_id AND NOT is_deleted")[0]
            raise web.seeother(page.path)
        else:
            raise web.seeother(link_to("pages", web.storage(id=page_id),
                                       "edit_code"))


class PageTree:

    @auth.restrict("admin", "editor")
    def GET(self, page_id):
        page = db.select("pages", locals(),
                         where="id=$page_id AND NOT is_deleted")[0]
        blocks = list(db.select(
            "blocks",
            page,
            where="page_id IS NULL OR page_id=$id AND NOT is_deleted",
            order="container, position",
        ))
        return render.pages.tree(page, blocks)


class PageInfo:

    @auth.restrict("admin", "editor")
    def GET(self, page_id):
        page = db.select("pages", locals(),
                         where="id=$page_id AND NOT is_deleted")[0]
        web.header("Content-Type", "application/json")
        return json.dumps(dict(page), default=dthandler)


class DeletePage:

    @auth.restrict("admin", "editor")
    def GET(self, page_id):
        if page_id == "1":
            raise flash.redirect(_(cannot_delete_root_text), "/", "error")
        delete_branch(page_id, datetime.datetime.now())
        raise flash.redirect(_(page_deleted_text), "/a/pages")


class ToPage:

    def GET(self, page_id):
        try:
            page = db.select("pages", locals(),
                             where="id=$page_id AND NOT is_deleted")[0]
            if not page.is_published and not auth.get_user():
                raise flash.redirect(_(page_access_forbidden_text), "/login")
            else:
                raise web.seeother(page.path)
        except IndexError:
            raise web.notfound()


class ViewPage:

    def GET(self, page_path):
        try:
            page = db.select("pages", locals(),
                             where="path=$page_path AND NOT is_deleted")[0]
            if not page.is_published and not auth.get_user():
                raise flash.redirect(_(page_access_forbidden_text), "/login")
            load_navigation(page)
            block = db.select(
                "blocks",
                page,
                where="page_id=$id AND block_id IS NULL AND NOT is_deleted",
            )[0]
            blocks = list(db.select(
                "blocks",
                page,
                where="(page_id IS NULL OR page_id=$id) AND NOT is_deleted",
                order="position",
            ))
            return render.pages.page(page, block, blocks)
        except IndexError:
            raise web.notfound()
