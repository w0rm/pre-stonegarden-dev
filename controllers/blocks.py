# coding: utf-8

import web
import os
import datetime
from config import config
from base import db, auth, flash
from modules.translation import _, N_
from modules.restful_controller import RESTfulController
from modules.form import *
from template import render, render_partial, render_block, link_to
from web import ctx
from pytils.translit import slugify
from models.blocks import *
from models.pages import get_page_by_id, load_page_data


blockPasteForm = web.form.Form(
    Textbox("block_id"),
    Textbox("position", notnull),
    # Validate presence of block in session
    validators=[web.form.Validator(
        N_("Buffer is empty."),
        lambda form: get_block_from_session())]
)


class Blocks(RESTfulController):

    form = web.form.Form(
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
        block_form = self.form()
        if block_form.validates(d):
            block = create_block(block_form.d)
            raise web.seeother(link_to("blocks", block, page_id=d.page_id))
        return "NOT OK"

    @auth.restrict("admin", "editor")
    def update(self, block_id):
        d = web.input(page_id=None, sizes=[])
        block_form = self.form()
        if block_form.validates(d):
            block = update_block_by_id(block_id, block_form.d)
            raise web.seeother(link_to("blocks", block, page_id=d.page_id))
        return "NOT OK"

    @auth.restrict("admin", "editor")
    def delete(self, block_id):
        delete_block_by_id(block_id)
        web.header("Content-Type", "application/json")
        return '{"status":1}'


class CopyBlock:

    @auth.restrict("admin", "editor")
    def POST(self, block_id):
        block = get_block_by_id(block_id)
        save_block_in_session(block)
        web.header("Content-Type", "application/json")
        return '{"status":1}'


class CutBlock:

    @auth.restrict("admin", "editor")
    def POST(self, block_id):
        print "DELETE"
        block = delete_block_by_id(block_id)
        save_block_in_session(block)
        web.header("Content-Type", "application/json")
        return '{"status":1}'


class PasteBlock:

    @auth.restrict("admin", "editor")
    def POST(self):

        d = web.input(page_id=None, is_template=False)
        block_form = blockPasteForm()

        if block_form.validates():

            # Retreive block from session
            saved_block = get_block_from_session()

            # Update block with form data
            saved_block.update(block_form.d)

            block = create_block(saved_block, d.is_template, d.page_id)
            raise web.seeother(link_to("blocks", block, page_id=d.page_id))

        return "NOT OK"
