# coding: utf-8

import web
import os
import datetime
import json
from config import config
from base import db, auth, flash
from modules.translation import _, N_
from modules.utils import dthandler
from template import render, render_partial, render_block
from template import link_to, smarty, sanitize
from modules.form import *
from web import ctx
from pytils.translit import slugify
from models.pages import load_navigation
from models.blocks import *

blockForm = web.form.Form(
    Textbox("block_id"),
    Textbox("position", notnull),
    Textbox("container"),
    Textbox("template"),
    Textbox("content"),
    Textbox("params"),
)

blockPasteForm = web.form.Form(
    Textbox("block_id"),
    Textbox("container"),
    Textbox("position", notnull),
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
    def GET(self, block_id, format):
        block = get_block_by_id(block_id)
        if format == ".json":
            web.header("Content-Type", "application/json")
            return json.dumps(block, default=dthandler)
        else:
            # page_id should be set
            page_id = web.input(page_id=None).page_id
            page = db.select("pages", locals(),
                             where="id = $page_id AND NOT is_deleted")[0]
            load_navigation(page)
            blocks = db.select(
                "blocks",
                locals(),
                where="(page_id IS NULL OR page_id=$page_id) "
                      "AND NOT is_deleted",
                order="position",
            ).list()
            return unicode(render_partial.ui.block(block, blocks, page))

    @auth.restrict("admin", "editor")
    def PUT(self, block_id, format):
        # page_id should be set
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
            raise web.seeother(link_to(
                "blocks", block_id=block_id, page_id=page_id))
        return "NOT OK"

    @auth.restrict("admin", "editor")
    def DELETE(self, block_id, format):
        block = get_block_by_id(block_id)
        db.update(
            "blocks",
            where="id = $id AND NOT is_deleted",
            vars=block,
            is_deleted=1)
        if block.block_id:
            db.update(
                "blocks",
                where="block_id = $block_id AND container = $container "
                      "AND position > $position AND NOT is_deleted",
                vars=block,
                position=web.SQLLiteral("position-1"),
            )
        else:
            db.update(
                "blocks",
                where="container = $container AND position > $position "
                      "AND NOT is_deleted",
                vars=block,
                position=web.SQLLiteral("position-1"),
            )

        if web.ctx.env.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest':
            web.header("Content-Type", "application/json")
            return json.dumps(dict(status=1))
        else:
            raise web.seeother(web.ctx.env.get('HTTP_REFERER', '/'))


class Blocks:

    @auth.restrict("admin", "editor")
    def GET(self):
        d = web.input(page_id=None, block_id=None, container=None)
        page = db.select(
            "pages",
            d,
            where="id = $page_id AND NOT is_deleted"
        )[0]
        load_navigation(page)
        page_blocks = db.select(
            "blocks",
            d,
            where="(page_id IS NULL OR page_id=$page_id) AND NOT is_deleted",
            order="position",
        ).list()
        if d.block_id:
            block = get_block_by_id(d.block_id)
            if d.container:
                blocks = db.select(
                    "blocks",
                    d,
                    where="container = $container AND block_id = "
                          "$block_id AND NOT is_deleted",
                    order="position ASC",
                ).list()
            else:
                blocks = [block]
        else:
            blocks = db.select(
                "blocks",
                d,
                where="container = $container AND block_id is NULL "
                      "AND NOT is_deleted",
                order="position ASC",
            ).list()
        res = u""
        for b in blocks:
            res += unicode(render_partial.ui.block(b, page_blocks, page))
        return res

    @auth.restrict("admin", "editor")
    def POST(self):
        # page_id should be set
        d = web.input(page_id=None, is_template=False)
        block_form = blockForm(d)

        if block_form.valid:
            block = block_form.d

            if not block.block_id and not d.is_template:
                page_block = db.select(
                    "blocks",
                    d,
                    what="id",
                    where="page_id = $page_id AND block_id IS "
                          "NULL AND NOT is_deleted",
                    limit=1,
                )[0]
                block.block_id = page_block.id

            if block.block_id:
                parent = get_block_by_id(block.block_id)
                if parent.blocks:
                    parent_blocks = parent.blocks + "," + str(parent.id)
                else:
                    parent_blocks = str(parent.id)
                block.update(
                    page_id=parent.page_id,
                    blocks=parent_blocks,
                    level=parent.level + 1,
                )
                db.update(
                    "blocks",
                    where="block_id = $block_id AND container = $container "
                          "AND position >= $position AND NOT is_deleted",
                    vars=block,
                    position=web.SQLLiteral("position+1"),
                )
            else:
                block.level = 0
                db.update(
                    "blocks",
                    where="container = $container AND position >= "
                          "$position AND NOT is_deleted",
                    vars=block,
                    position=web.SQLLiteral("position+1"),
                )

            block_id = db.insert(
                "blocks",
                created_at=datetime.datetime.now(),
                content_cached=smarty(sanitize(block.content)),
                is_published=True,
                **block)

            raise web.seeother(link_to("blocks", block_id=block_id,
                                       page_id=d.page_id))

        return "NOT OK"


class EditBlockTemplate:

    @auth.restrict("admin", "editor")
    def POST(self, block_id):
        # page_id should be set
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
            # Return all blocks from the container of our block
            if block.block_id:
                raise web.seeother(link_to(
                    "blocks",
                    block_id=block.block_id,
                    container=block.container,
                    page_id=page_id,
                ))
            else:
                raise web.seeother(link_to(
                    "blocks",
                    container=block.container,
                    page_id=page_id,
                ))
        return "NOT OK"


class EditBlockSettings:

    @auth.restrict("admin", "editor")
    def POST(self, block_id):
        # page_id should be set
        page_id = web.input(page_id=None).page_id
        block = get_block_by_id(block_id)
        block_form = blockSettingsForm(web.input())
        if block_form.valid:
            db.update(
                "blocks",
                where="$block_id = id",
                vars=locals(),
                updated_at=datetime.datetime.now(),
                **block_form.d)
            raise web.seeother(link_to(
                "blocks", block_id=block_id, page_id=page_id))
        return "NOT OK"


class WrapBlock:

    @auth.restrict("admin", "editor")
    def POST(self, block_id):
        # page_id should be set
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
            raise web.seeother(link_to(
                "blocks", block_id=block_id, page_id=page_id))
        return "NOT OK"


class UnwrapBlock:

    @auth.restrict("admin", "editor")
    def POST(self, block_id):
        # page_id should be set
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
        # return container contents
        if block.block_id:
            raise web.seeother(link_to(
                "blocks",
                block_id=block.block_id,
                container=block.container,
                page_id=page_id,
            ))  # block belongs to another block
        else:
            raise web.seeother(link_to(
                "blocks",
                container=block.container,
                page_id=page_id,
            ))  # block belongs to template


class MoveBlock:

    @auth.restrict("admin", "editor")
    def POST(self, block_id):
        d = web.input(duplicate=False, page_id=None)
        # page_id should be set
        page_id = web.input(page_id=None).page_id
        block = get_block_by_id(block_id)
        web.ctx.session.buffer = web.storage(
            block=block,
            duplicate=d.duplicate,
        )
        if not d.duplicate:
            db.update(
                "blocks",
                where="id = $block_id",
                vars=locals(),
                updated_at=datetime.datetime.now(),
                is_published=False,
            )
        raise web.seeother(link_to(
            "blocks", block_id=block_id, page_id=d.page_id))


class PasteBlock:

    @auth.restrict("admin", "editor")
    def POST(self):
        # TODO for nested block update children recursively
        # page_id should be set
        d = web.input(page_id=None, is_template=False)
        block_form = blockPasteForm(d)
        saved_buffer = web.ctx.session.pop("buffer", None)
        if block_form.valid and saved_buffer is not None:
            block = block_form.d
            if not block.block_id and not d.is_template:
                page_block = db.select(
                    "blocks",
                    d,
                    what="id",
                    where="page_id = $page_id AND block_id IS NULL "
                          "AND NOT is_deleted",
                    limit=1,
                )[0]
                block.block_id = page_block.id

            remembered_block = saved_buffer.block
            same_container = (remembered_block.container == block.container
                              and remembered_block.block_id == block.block_id)

            if block.block_id:
                parent = get_block_by_id(block.block_id)
                if parent.blocks:
                    parent_blocks = parent.blocks + "," + str(parent.id)
                else:
                    parent_blocks = str(parent.id)

                block.update(
                    page_id=parent.page_id,
                    blocks=parent_blocks,
                    level=parent.level + 1,
                )
                db.update(
                    "blocks",
                    where="block_id = $block_id AND container = $container "
                          "AND position >= $position AND NOT is_deleted",
                    vars=block,
                    position=web.SQLLiteral("position+1"),
                )
            else:
                block.level = 0
                db.update(
                    "blocks",
                    where="container = $container AND position >= $position "
                          "AND NOT is_deleted",
                    vars=block,
                    position=web.SQLLiteral("position+1"),
                )
            remembered_block.update(
                page_id=None,
                is_deleted=0,
            )
            if saved_buffer.duplicate:
                remembered_block.update(
                    created_at=datetime.datetime.now(),
                    updated_at=None,
                    **block)
                remembered_block.pop("id")
                remembered_block.id = db.insert("blocks", **remembered_block)
            else:
                # Shift all positions for the blocks
                # after the block that we move
                if not same_container:
                    db.update(
                        "blocks",
                        where="block_id = $block_id AND container = $container"
                              " AND position >= $position AND NOT is_deleted",
                        vars=remembered_block,
                        position=web.SQLLiteral("position-1"),
                    )
                remembered_block.update(
                    updated_at=datetime.datetime.now(),
                    **block)
                db.update(
                    "blocks",
                    where="id = $id",
                    vars=remembered_block,
                    **remembered_block)
            raise web.seeother(link_to(
                "blocks", block_id=remembered_block.id, page_id=d.page_id))
        return "NOT OK"
