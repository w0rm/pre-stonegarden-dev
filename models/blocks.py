import web
import json
from base import db
from modules.utils import dthandler
from template import render_partial, smarty, sanitize
from models.pages import load_navigation, get_page_by_id


def create_block(block, is_template=False, page_id=None):
    """Creates block from passed dict and returns it."""

    # Set block_id to page block id
    # TODO: move it in javascript
    if not block.get("block_id") and not is_template:
        parent = get_page_block_by_page_id(page_id)
        block.block_id = parent.id

    where = ("container = $container AND position >= $position "
             "AND NOT is_deleted")

    if block.get("block_id"):
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
        where += " AND block_id = $block_id"
    else:
        block.level = 0
        where += " AND block_id IS NULL"

    # Shift blocks positions to free the place for new block
    db.update(
        "blocks",
        where=where,
        vars=block,
        position=web.SQLLiteral("position+1"),
    )

    block.update(
        created_at=web.SQLLiteral("CURRENT_TIMESTAMP"),
        content_cached=smarty(sanitize(block.content)),
        is_published=True,
    )

    block.id = db.insert("blocks", **block)

    return block


def delete_block_by_id(block_id):

    """Deletes block and returns deleted block."""

    block = get_block_by_id(block_id)
    where = ("container = $container AND position > $position "
             "AND NOT is_deleted")

    db.update(
        "blocks",
        where="id = $id AND NOT is_deleted",
        vars=block,
        is_deleted=1)

    if block.block_id:
        where += " AND block_id = $block_id"
    else:
        where += " AND block_id IS NULL"

    # Shift positions of the blocks after deleted block
    db.update(
        "blocks",
        where=where,
        vars=block,
        position=web.SQLLiteral("position-1"),
    )

    return block


def save_block_in_session(block):
    """Removes ids attributes and saves block in session"""
    remove_attributes = "id", "block_id", "blocks", "page_id", "level"
    copied_block = web.storage((k, v) for k, v in block.iteritems()
                               if k not in remove_attributes)
    web.ctx.session.buffer = web.storage(block=copied_block)
    return copied_block


def get_block_from_session():
    """Retreives block from session"""
    # We have to copy dict, because it can be changed later
    # in code and we don't want the changes in session
    return web.storage(web.ctx.session.buffer.block)


def get_block_by_id(block_id):
    return db.select(
        "blocks",
        locals(),
        where="id = $block_id AND NOT is_deleted",
        limit=1,
    )[0]


def get_page_block_by_page_id(page_id):
    """Returns root block of the page"""
    return db.select(
        "blocks",
        locals(),
        what="id",
        where="page_id = $page_id AND block_id IS "
        "NULL AND NOT is_deleted",
        limit=1,
    )[0]


def get_blocks_by_page_id(page_id):
    """Returns all page blocks and all template blocks"""
    return db.select(
        "blocks",
        locals(),
        where="(page_id IS NULL OR page_id=$page_id) "
        "AND NOT is_deleted",
        order="container, position",
    ).list()


def get_blocks_by_conainer(container, block_id=None):
    """Returns all blocks for specic container"""

    where = "container = $container AND NOT is_deleted"

    if block_id is None:
        # For root template blocks
        where += " AND block_id IS NULL"
    else:
        where += " AND block_id = $block_id"

    return db.select("blocks", locals(), where=where,
                     order="position ASC").list()


def block_to_json(block_id, page_id=None):
    """Renders block in JSON format.
       If page_id is not None then adds html contents.
    """
    block = get_block_by_id(block_id)
    result = dict(block=block)
    if page_id is not None:
        page = get_page_by_id(page_id)
        load_navigation(page)
        blocks = get_blocks_by_page_id(page.id)
        result["html"] = unicode(render_partial.ui.block(block, blocks, page))

    return json.dumps(result, default=dthandler)
