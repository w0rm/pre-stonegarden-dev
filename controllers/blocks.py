# coding: utf-8

import web
import os
import datetime
from config import config
from base import db, auth, flash
from modules.translation import _, N_
from modules.restful_controller import RESTfulController
from modules.form import ApiForm, notnull
from template import render, render_partial, render_block, link_to
from web import ctx
from pytils.translit import slugify
from models.blocks import *
from models.pages import get_page_by_id, load_page_data


class Blocks(RESTfulController):

    form = ApiForm(
        web.form.Input("parent_id", notnull),
        web.form.Input("position", notnull),
        web.form.Input("template", notnull),
        web.form.Input("type"),
        # For row blocks
        web.form.Input("sizes"),
        # For content blocks
        web.form.Input("content"),
        # For all blocks (settings)
        web.form.Input("css_class"),
        web.form.Input("is_published"),
    )

    @auth.restrict("admin", "editor")
    def get(self, block_id):
        d = web.input(page_id=None)
        page = get_page_by_id(d.page_id)
        load_page_data(page)
        block = get_block_by_id(block_id)
        web.header("Content-Type", "application/json")
        return block_to_json(block)

    @auth.restrict("admin", "editor")
    def create(self):
        d = web.input(page_id=None, sizes=[])
        form = self.form()
        if form.validates(d):
            block = create_block(form.d)
            raise web.seeother(link_to("blocks", block, page_id=d.page_id))
        raise form.validation_error()

    @auth.restrict("admin", "editor")
    def update(self, block_id):
        d = web.input(page_id=None, sizes=[])
        form = self.form()
        if form.validates(d):
            block = update_block_by_id(block_id, form.d)
            raise web.seeother(link_to("blocks", block, page_id=d.page_id))
        raise form.validation_error()

    @auth.restrict("admin", "editor")
    def delete(self, block_id):
        delete_block_by_id(block_id)
        web.header("Content-Type", "application/json")
        return '{"status":1}'
