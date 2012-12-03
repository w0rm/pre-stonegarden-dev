# coding: utf-8

import web
import os
import datetime
import json
from config import config
from base import db, auth, flash
from modules.translation import _, N_
from modules.utils import dthandler
from template import render, render_partial, link_to
from modules.form import *
from modules.restful_controller import RESTfulController

from models.pages import *
from models.blocks import (load_page_blocks, get_page_block_by_page_id,
                           block_to_json, template_blocks_to_json)


page_access_forbidden_text = N_("Page access forbidden.")


class Sitemap:

    @auth.restrict("admin", "editor", "user")
    def GET(self):
        pages = db.select("pages", where="NOT is_deleted")
        return render.pages.sitemap(pages)


class Pages(RESTfulController):

    form = ApiForm(
        web.form.Input("name", notnull),
        web.form.Input("title", notnull),
        web.form.Input("parent_id"),
        web.form.Input("position"),  # if null then get last position
        web.form.Input("slug"),
        web.form.Input("type"),  # TODO: check available
        web.form.Input("description"),  # wysiwyg
        web.form.Input("meta_description"),
        web.form.Input("meta_keywords"),
        web.form.Input("css_code"),
        web.form.Input("js_code"),
        web.form.Checkbox("is_published"),
        web.form.Checkbox("is_navigatable"),
    )

    filter_form = ApiForm(
        web.form.Input("parent_id"),
    )

    @auth.restrict("admin", "editor", "user")
    def list(self):
        """List pages (filtered by @parent_id)"""
        form = self.filter_form()
        if form.validates():
            query = form.d
            if form.d.parent_id:
                pages = get_pages_by_parent_id(query.parent_id)
            else:
                pages = get_pages_in_tree_order()
            web.header("Content-Type", "application/json")
            return pages_to_json(pages)
        raise form.validation_error()

    @auth.restrict("admin", "editor")
    def create(self):
        """Create new page"""
        form = self.form()
        if form.validates():
            page = create_page(form.d)
            raise web.seeother(link_to("pages", page))
        raise form.validation_error()

    @auth.restrict("admin", "editor", "user")
    def get(self, page_id):
        """Get page by id"""
        page = get_page_by_id(page_id)
        web.header("Content-Type", "application/json")
        return page_to_json(page)

    @auth.restrict("admin", "editor")
    def update(self, page_id):
        """Update page by id"""
        form = self.form()
        if form.validates():
            page = update_page_by_id(page_id, form.d)
            raise web.seeother(link_to("pages", page))
        raise form.validation_error()

    @auth.restrict("admin", "editor")
    def delete(self, page_id):
        """Delete page by id"""
        delete_page_by_id(page_id)
        web.header("Content-Type", "application/json")
        return '{"status": 1}'


class ToPage:
    """Redirects to page by its id"""

    def GET(self, page_id):
        try:
            page = get_page_by_id(page_id)
            if not page.is_published and not auth.get_user():
                raise flash.redirect(_(page_access_forbidden_text), "/login")
            else:
                raise web.seeother(page.path)
        except IndexError:
            raise web.notfound()


class ViewPage:
    """Displays page by path"""

    def GET(self, page_path):
        try:
            page = db.select("pages", locals(),
                             where="path=$page_path AND NOT is_deleted")[0]
            if not page.is_published and not auth.get_user():
                raise flash.redirect(_(page_access_forbidden_text), "/login")
            load_page_data(page)
            json_data = web.storage(
                page=page_to_json(page)
            )
            if "edit" in web.input() and auth.has_role("admin", "editor"):
                json_data.update(
                    page_block=block_to_json(
                        get_page_block_by_page_id(page.id)),
                    template_blocks=template_blocks_to_json()
                )
            else:
                load_page_blocks(page.id)

            return render.pages.page(json_data)
        except IndexError:
            raise web.notfound()
