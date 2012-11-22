import web
import json
from base import db
from modules.utils import dthandler
from template import render_block, smarty, sanitize
from models.pages import load_page_data, get_page_by_id


def update_block_by_id(block_id, data):

    block = get_block_by_id(block_id)

    # Get column sizes from data
    sizes = data.pop("sizes")

    db.update(
        "blocks",
        where="$block_id = id",
        vars=locals(),
        content_cached=smarty(sanitize(data.content)),
        updated_at=web.SQLLiteral("CURRENT_TIMESTAMP"),
        **data)

    return block


def create_block(block):
    """Creates block from passed dict and returns it."""

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

    sizes = block.pop("sizes")

    block.id = db.insert("blocks", **block)

    # Create columns for row block
    if block.template == "row":
        column = web.storage(
            created_at=web.SQLLiteral("CURRENT_TIMESTAMP"),
            is_published=True,
            page_id=parent.page_id,
            parent_id=block.id,
            ids=block.ids + "," + str(block.id),
            level=block.level + 1,
            template="column",
            position=1,
        )
        for i, size in enumerate(sizes):
            column.position = i + 1
            column.size = size
            db.insert("blocks", **column)

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

    if block.parent_id:
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


def get_blocks_by_parent_id(block_id=None):
    """Returns all blocks for specific parent block"""
    return db.select("blocks", locals(),
                     where="parent_id = $block_id AND NOT is_deleted",
                     order="position ASC").list()


def get_page_block_by_page_id(page_id):
    """Returns root block of the page"""
    return db.select(
        "blocks",
        locals(),
        where="page_id = $page_id AND parent_id IS "
        "NULL AND NOT is_deleted",
        limit=1,
    )[0]


def get_page_blocks_by_page_id(page_id):
    """Returns all page blocks"""
    return db.select(
        "blocks",
        locals(),
        where="(page_id = $page_id OR page_id IS NULL) AND NOT is_deleted",
        order="position",
    ).list()


def get_template_blocks():
    """Returns all template blocks"""
    return db.select(
        "blocks",
        where="page_id IS NULL AND NOT is_deleted",
        order="position",
    ).list()


def build_block_tree(block, blocks, with_render=False):
    if with_render:
        block.html = unicode(render_block(block))
    block.blocks = [build_block_tree(b, blocks, with_render)
                    for b in blocks if b.parent_id == block.id]
    return block


def build_template_blocks_tree(with_render=False):
    template_blocks = get_template_blocks()
    return [build_block_tree(block, template_blocks, with_render=with_render)
            for block in template_blocks if block.parent_id is None]


def load_page_blocks(page_id):
    """Preloads all blocks in ctx"""
    page_block = get_page_block_by_page_id(page_id)
    page_blocks = get_page_blocks_by_page_id(page_id)
    web.ctx.page_block = build_block_tree(page_block, page_blocks)
    web.ctx.template_blocks = dict((v.name, v)
                                   for v in build_template_blocks_tree())


def template_blocks_to_json():
    """Renders template blocks"""
    return json.dumps(
        build_template_blocks_tree(with_render=True),
        default=dthandler, sort_keys=True, indent=2)


def block_to_json(block):
    """Renders block in JSON format."""
    page_blocks = get_page_blocks_by_page_id(block.page_id)
    build_block_tree(block, page_blocks, with_render=True)
    return json.dumps(block, default=dthandler, sort_keys=True, indent=2)
