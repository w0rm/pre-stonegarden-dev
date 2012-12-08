import web
import json
from base import db
from modules.utils import dthandler
from template import render_block, smarty, sanitize
from models.pages import load_page_data, get_page_by_id


def create_block(block, is_template=False, page_id=None):
    """Creates block from passed dict and returns it."""

    # Set parent_id to page block id
    # TODO: move it in javascript
    if not block.get("parent_id") and not is_template:
        parent = get_page_block_by_page_id(page_id)
        block.parent_id = parent.id

    where = "position >= $position AND NOT is_deleted"

    if block.get("parent_id"):
        parent = get_block_by_id(block.parent_id)
        if parent.ids:
            parent_blocks = parent.ids + "," + str(parent.id)
        else:
            parent_blocks = str(parent.id)
        block.update(
            page_id=parent.page_id,
            ids=parent_blocks,
            level=parent.level + 1,
        )
        where += " AND parent_id = $parent_id"
    else:
        block.level = 0
        where += " AND parent_id IS NULL"

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
    where = "position > $position AND NOT is_deleted"

    db.update(
        "blocks",
        where="id = $id AND NOT is_deleted",
        vars=block,
        is_deleted=1)

    if block.block_id:
        where += " AND parent_id = $parent_id"
    else:
        where += " AND parent_id IS NULL"

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
        where="page_id = $page_id AND parent_id IS "
        "NULL AND NOT is_deleted",
        limit=1,
    )[0]


def get_blocks(page_id=None):
    """Returns all page blocks or all template blocks"""
    return db.select(
        "blocks",
        locals(),
        where="(page_id IS NULL OR page_id = $page_id) AND NOT is_deleted",
        order="position",
    ).list()


def build_block_tree(block, blocks):
    block.blocks = [build_block_tree(b, blocks)
                    for b in blocks if b.parent_id == block.id]
    return block


def load_page_blocks(page_id):
    """Preloads all blocks dict in ctx"""
    blocks = get_blocks(page_id)
    web.ctx.page_block = build_block_tree(
        get_page_block_by_page_id(page_id),
        blocks
    )
    web.ctx.template_blocks = web.storage(
        (block.name, build_block_tree(block, blocks))
        for block in blocks
        if block.parent_id is None and block.page_id is None)


def get_blocks_by_parent_id(block_id=None):
    """Returns all blocks for specific parent block"""
    return db.select("blocks", locals(),
                     where="parent_id = $block_id AND NOT is_deleted",
                     order="position ASC").list()


def block_to_json(block_id, page_id=None):
    """Renders block in JSON format.
       If page_id is not None then adds html contents.
    """
    block = get_block_by_id(block_id)
    result = dict(block=block)
    if page_id is not None:
        page = get_page_by_id(page_id)
        load_page_data(page)
        blocks = get_blocks()
        result["html"] = unicode(
            render_block(
                build_block_tree(block, blocks)
            )
        )

    return json.dumps(result, default=dthandler)
