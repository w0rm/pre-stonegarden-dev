# coding: utf-8

import web
import os
import datetime
from config import config
from base import db, auth, flash
from modules.translation import _, N_
from template import render, render_partial, render_block
from template import link_to
from modules.form import *
from web import ctx
from pytils.translit import slugify
from models.pages import load_navigation, get_page_by_id
from models.blocks import *

blockForm = web.form.Form(
    Textbox("block_id"),
    Textbox("position", notnull),
    Textbox("template"),
    Textbox("content"),
    Textbox("params"),
)

blockPasteForm = web.form.Form(
    Textbox("block_id"),
    Textbox("position", notnull),
    # Validate presence of block in session
    validators=[web.form.Validator(
        N_("Buffer is empty."),
        lambda form: get_block_from_session())]
)

blockEditForm = web.form.Form(
    Textbox("content"),
    Textbox("params"),
)

blockTemplateForm = web.form.Form(
    Textbox("template", notnull),  # TODO: check for the right value.
)

blockSettingsForm = web.form.Form(
    Textbox("css_class"),
    Checkbox("is_published", description=N_("Show on site"), value="ok"),
)


class Block:

    @auth.restrict("admin", "editor")
    def GET(self, block_id):
        page_id = web.input(page_id=None).page_id
        web.header("Content-Type", "application/json")
        return block_to_json(block_id, page_id)

    @auth.restrict("admin", "editor")
    def PUT(self, block_id):
        page_id = web.input(page_id=None).page_id
        block = get_block_by_id(block_id)
        block_form = blockEditForm(web.input())
        if block_form.valid:
            db.update(
                "blocks",
                where="$block_id = id",
                vars=locals(),
                content_cached=smarty(sanitize(block_form.d.content)),
                updated_at=datetime.datetime.now(),
                **block_form.d)
            raise web.seeother(link_to("blocks", block, page_id=page_id))

        return "NOT OK"

    @auth.restrict("admin", "editor")
    def DELETE(self, block_id):
        delete_block_by_id(block_id)
        web.header("Content-Type", "application/json")
        return '{"status":1}'


class EditBlockSettings:

    @auth.restrict("admin", "editor")
    def POST(self, block_id):
        page_id = web.input(page_id=None).page_id
        block = get_block_by_id(block_id)
        block_form = blockSettingsForm(web.input())
        if block_form.valid:
            db.update(
                "blocks",
                where="$block_id = id",
                vars=locals(),
                updated_at=web.SQLLiteral("CURRENT_TIMESTAMP"),
                **block_form.d)
            raise web.seeother(link_to("blocks", block, page_id=page_id))
        return "NOT OK"


class Blocks:

    @auth.restrict("admin", "editor")
    def POST(self):
        d = web.input(is_template=False, page_id=None)
        block_form = blockForm()
        if block_form.validates():
            block = create_block(block_form.d, d.is_template, d.page_id)
            raise web.seeother(link_to("blocks", block, page_id=d.page_id))
        return "NOT OK"


class EditBlockTemplate:

    @auth.restrict("admin", "editor")
    def _POST(self, block_id):
        page_id = web.input(page_id=None).page_id
        block = get_block_by_id(block_id)
        block_form = blockTemplateForm(web.input())
        if block_form.valid:
            # Update block's template
            db.update(
                "blocks",
                where="$block_id = id",
                vars=locals(),
                updated_at=datetime.datetime.now(),
                **block_form.d)
            # Select all orphaned blocks
            orphans = db.select(
                "blocks",
                dict(
                    containers=config.containers[block_form.d.template],
                    block_id=block_id,
                ),
                where="$block_id = block_id AND NOT container "
                      "IN $containers AND NOT is_deleted",
                order="container, position"
            ).list()
            if len(orphans):
                # Shift children position after the unwrapped block
                if block.block_id:
                    db.update(
                        "blocks",
                        where="block_id = $block_id AND container = "
                              "$container AND position > $position "
                              "AND NOT is_deleted",
                        vars=block,
                        position=web.SQLLiteral("position + %d" %
                                                len(orphans)),
                    )
                else:
                    db.update(
                        "blocks",
                        where="container = $container "
                              "AND position > $position "
                              "AND NOT is_deleted",
                        vars=block,
                        position=web.SQLLiteral("position + %d" %
                                                len(orphans)),
                    )

                # Insert orphans to the parent container after the block
                # TODO: recursively update block_id and level of subchildren
                n = 0
                for b in orphans:
                    db.update(
                        "blocks", where="id = $id", vars=b,
                        block_id=block.block_id,
                        blocks=block.blocks,
                        level=block.level,
                        container=block.container,
                        position=block.position + 1 + n,
                    )
                    n += 1
            # Return block with updated template
            raise web.seeother(link_to("blocks", block, page_id=page_id))

        return "NOT OK"


class WrapBlock:

    @auth.restrict("admin", "editor")
    def _POST(self, block_id):
        """
        Creates new block and places current block in it.
        Then redirects to newly created block.
        """
        page_id = web.input(page_id=None).page_id
        block = get_block_by_id(block_id)
        block_form = blockTemplateForm(web.input())
        if block_form.valid:
            block_id = db.insert(
                "blocks",
                created_at=datetime.datetime.now(),
                page_id=block.page_id,
                block_id=block.block_id,
                blocks=block.blocks,
                level=block.level,
                container=block.container,
                position=block.position,
                is_published=True,
                **block_form.d)

            if block.blocks:
                parent_blocks = block.blocks + "," + str(block.id)
            else:
                parent_blocks = str(block.id)

            db.update(
                "blocks",
                where="$id = id",
                vars=block,
                block_id=block_id,
                blocks=parent_blocks,
                level=block.level + 1,
                container="primary",
                position=1,
            )
            raise web.seeother(
                link_to("blocks", dict(id=block_id), page_id=page_id))
        return "NOT OK"


class UnwrapBlock:

    @auth.restrict("admin", "editor")
    def _POST(self, block_id):
        page_id = web.input(page_id=None).page_id
        block = get_block_by_id(block_id)
        children = db.select(
            "blocks",
            block,
            where="block_id = $id AND NOT is_deleted",
            order="container, position",
        ).list()

        # Delete parent block
        db.update(
            "blocks",
            where="id = $id AND NOT is_deleted",
            vars=block,
            is_deleted=1)

        # Shift children position after the unwrapped block
        if block.block_id:
            db.update(
                "blocks",
                where="block_id = $block_id AND container = $container "
                      "AND position > $position AND NOT is_deleted",
                vars=block,
                position=web.SQLLiteral("position - 1 + %d" % len(children)),
            )
        else:
            db.update(
                "blocks",
                where="container = $container AND "
                      "position > $position AND NOT is_deleted",
                vars=block,
                position=web.SQLLiteral("position - 1 + %d" % len(children)),
            )

        # Insert children to the parent container
        # TODO: recursively update block_id and level of subchildren
        n = 0
        for b in children:
            db.update(
                "blocks", where="id = $id", vars=b,
                block_id=block.block_id,
                blocks=block.blocks,
                level=block.level,
                container=block.container,
                position=n + block.position,
            )
            n += 1

        # Return container contents
        raise web.seeother(link_to(
            "blocks",
            block_id=block.block_id,  # Isn't set if is None
            container=block.container,
            page_id=page_id,
        ))


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
