# coding: utf-8

import web
from base import db, auth, flash
from modules.translation import _, N_
from template import render, render_partial, link_to
from modules.form import ApiForm, DateInput, Checkbox, validDate, notnull
from modules.restful_controller import RESTfulController

from models.pages import *

from models.blocks import (load_page_blocks, get_page_block_by_page_id,
                           block_to_json, template_blocks_to_json)


page_access_forbidden_text = N_("Page access forbidden.")


class Sitemap:

    @auth.restrict("admin")
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
        DateInput("published_at", validDate),  # defaults to NOW
        Checkbox("is_published"),
        Checkbox("is_navigatable"),
    )

    filter_form = ApiForm(
        web.form.Input("parent_id"),
    )

    @auth.restrict("admin")
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

    @auth.restrict("admin")
    def create(self):
        """Create new page"""
        d = web.input(type="page")
        form = self.form()
        if form.validates(d):
            page = create_page(form.d)
            raise web.seeother(link_to("pages", page))
        raise form.validation_error()

    @auth.restrict("admin")
    def get(self, page_id):
        """Get page by id"""
        page = get_page_by_id(page_id)
        web.header("Content-Type", "application/json")
        return page_to_json(page)

    @auth.restrict("admin")
    def update(self, page_id):
        """Update page by id"""
        form = self.form()
        if form.validates():
            page = update_page_by_id(page_id, form.d)
            raise web.seeother(link_to("pages", page))
        raise form.validation_error()

    @auth.restrict("admin")
    def delete(self, page_id):
        """Delete page by id"""
        delete_page_by_id(page_id)
        web.header("Content-Type", "application/json")
        return '{"status": 1}'


class TinyMCELinkList:

    """Returns tinymce_link_list.js for tinymce"""

    def GET(self):
        link_list = pages_to_tinymce_link_list_json(get_pages_in_tree_order())
        web.header("Content-Type", "application/json")
        return link_list


class ToPage:
    """Redirects to page by its id"""
    # TODO: capture page params as well eg /to/<id>/2009

    def GET(self, page_id):
        try:
            page = get_page_by_id(page_id)
            if auth.get_user() or is_page_published(page):
                raise web.seeother(page.path)
            else:
                raise flash.redirect(_(page_access_forbidden_text), "/login")
        except IndexError:
            raise web.notfound()


class ViewPage:
    """Displays page by path"""

    def GET(self, page_path):
        try:
            page = get_page_by_path(page_path)
            if not page.is_published and not auth.get_user():
                raise flash.redirect(_(page_access_forbidden_text), "/login")
            load_page_data(page)

            if auth.has_role("admin"):
                json_data = web.storage(
                    page=page_to_json(page),
                    pages=pages_to_json(get_pages_in_tree_order()),
                )
            else:
                json_data = web.storage()

            if "edit" in web.input() and auth.has_role("admin"):
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
