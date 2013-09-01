import web
import json
from base import db, auth, flash
from modules.utils import dthandler
from template import smarty, sanitize, template_global, render_partial
from models.tree import *


def validate_row_block_form(form):
    if form.template == "row" and form.sizes:
        sizes = [int(s) for s in form.sizes]
        return sum(sizes) == 12 and all(s > 0 for s in sizes)
    return True


def update_block_by_id(block_id, data):

    block = get_block_by_id(block_id)

    # Cannot edit or delete system blocks
    if block.is_system:
        raise flash.error(
            _("Cannot edit or delete system blocks."))

    data.updated_at = web.SQLLiteral("CURRENT_TIMESTAMP")

    # Cannot change type and template of block
    del data["template"]
    del data["type"]

    if block.type == "wysiwyg":
        data.content_cached = smarty(sanitize(data.content))
    else:
        data.content_cached = smarty(data.content)

    # Get column sizes from data
    sizes = data.pop("sizes")

    # Don't change block position, it may be wrong
    # TODO: ensure correct position from the server
    position = data.pop("position")

    # TODO: wrap the code below in transaction
    db.update(
        "blocks",
        where="$block_id = id",
        vars=locals(),
        **data)

    # Update block with data
    # TODO: fix updated_at
    block.update(data)

    # Create columns for row block
    if block.template == "row" and sizes:
        block.orphans = update_columns(block, sizes)

    return block


def create_block(block):
    """Creates block from passed dict and returns it."""

    block.update(
        position=int(block.position),
        created_at=web.SQLLiteral("CURRENT_TIMESTAMP"),
        user_id=auth.get_user().id,
        is_published=True,
    )

    if block.type == "wysiwyg":
        block.content_cached = smarty(sanitize(block.content))
    else:
        block.content_cached = smarty(block.content)

    # TODO: wrap the code below in transaction
    if block.get("parent_id"):
        parent = get_block_by_id(block.parent_id)
        if parent.ids:
            parent_blocks = (parent.ids or "") + "," + str(parent.id)
        else:
            parent_blocks = str(parent.id)
        block.update(
            page_id=parent.page_id,
            ids=parent_blocks,
            level=parent.level + 1,
        )
        # Shift blocks positions to free the place for new block
        expand_tree_siblings("blocks", block)

    else:
        block.level = 0

    sizes = block.pop("sizes")
    block.id = db.insert("blocks", **block)

    # Create columns for row block
    if block.template == "row":
        create_columns(block, sizes)

    # TODO: fix created_at
    return block


def column_css_class(size):
    """"""
    return ("one", "two", "three", "four", "five",
            "six", "seven", "eight", "nine", "ten",
            "eleven", "twelve")[int(size) - 1]


def create_columns(block, sizes, start_index=0):

    # Basic column data
    column = web.storage(
        created_at=web.SQLLiteral("CURRENT_TIMESTAMP"),
        user_id=auth.get_user().id,
        is_published=True,
        is_system=True,
        page_id=block.page_id,
        parent_id=block.id,
        ids=block.ids + "," + str(block.id),
        level=block.level + 1,
        template="column",
        position=start_index + 1,
    )
    for size in sizes:
        db.insert("blocks",
                  size=size,
                  css_class=column_css_class(size),
                  **column)
        column.position += 1


def update_columns(block, sizes):

    columns = get_blocks_by_parent_id(block.id)
    edit_len = min(len(columns), len(sizes))
    create_len = len(sizes) - len(columns)
    orphan_blocks = []

    for i in range(edit_len):
        col, size = columns[i], sizes[i]
        db.update(
            "blocks",
            where="id = $id",
            vars=col,
            updated_at=web.SQLLiteral("CURRENT_TIMESTAMP"),
            size=size,
            css_class=column_css_class(size),
            position=i + 1,
        )

    if create_len >= 0:
        # Create columns
        create_columns(block, sizes[edit_len:], edit_len)
    else:
        # Remove columns
        position = block.position
        orphan_blocks = remove_columns(block, columns[create_len:])

    return orphan_blocks


def remove_columns(block, columns):

    # TODO: fix CURRENT_TIMESTAMP

    column_ids = (c.id for c in columns)
    print type(block.position)

    # Orphan update data
    orphan_data = web.storage(
        updated_at=web.SQLLiteral("CURRENT_TIMESTAMP"),
        page_id=block.page_id,
        parent_id=block.parent_id,
        ids=block.ids,
        level=block.level,
        position=block.position + 1,
    )

    orphans = []

    for column in columns:
        orphans += get_blocks_by_parent_id(column.id)
        delete_block_by_id(column.id, delete_system=True)

    # Shift positions of the blocks after orphans
    # Positions before:
    # 1 2 (3) 4 5
    # Positions after (3 orphans):
    # 1 2 (3) [4 5 6] 7 8
    # Blocks 4 5 shifted to 7 8
    #
    db.update(
        "blocks",
        where="parent_id = $parent_id AND NOT is_deleted AND "
              "position > $position",
        vars=block,
        position=web.SQLLiteral("position + %d" % len(orphans)),
    )

    # Insert orphans
    for orphan in orphans:
        orphan.update(orphan_data)
        db.update(
            "blocks",
            where="id = $id",
            vars=orphan,
            **orphan_data)
        orphan_data.position += 1

    return orphans


def delete_block_by_id(block_id, delete_system=False):
    """Deletes block and returns deleted block."""

    block = get_block_by_id(block_id)

    # Cannot delete system blocks
    if block.is_system and not delete_system:
        raise flash.error(
            _("Cannot edit or delete system blocks."))

    # TODO: wrap the code below in transaction
    if block.parent_id:
        # Collapse positions of the blocks after deleted block
        collapse_tree_siblings("blocks", block)

    return delete_tree_branch("blocks", block)


def get_block_by_id(block_id):
    return db.select(
        "blocks",
        locals(),
        where="id = $block_id AND NOT is_deleted",
        limit=1,
    )[0]


def get_blocks_by_parent_id(parent_id=None):
    """Returns all blocks for specific parent block"""
    return db.select("blocks", locals(),
                     where="parent_id = $parent_id AND NOT is_deleted",
                     order="position").list()


def get_page_block_by_page_id(page_id):
    """Returns root block of the page"""
    return db.select(
        "blocks",
        locals(),
        where="page_id = $page_id AND parent_id IS "
        "NULL AND NOT is_deleted",
        limit=1,
    )[0]


def get_page_blocks_by_page_id(page_id=None):
    """Returns all page blocks or template blocks"""
    where = "page_id IS NULL" if page_id is None else "page_id = $page_id"
    return db.select(
        "blocks",
        locals(),
        where=where + " AND NOT is_deleted",
        order="position",
    ).list()


def get_template_blocks():
    """Returns all template blocks"""
    return get_page_blocks_by_page_id(None)


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
        default=dthandler, sort_keys=True, indent=2).replace('</', '<\/')


def block_to_json(block):
    """Renders block in JSON format."""
    page_blocks = get_page_blocks_by_page_id(block.page_id)
    build_block_tree(block, page_blocks, with_render=True)
    return json.dumps(block, default=dthandler,
                      sort_keys=True, indent=2).replace('</', '<\/')


@template_global
def render_block(block):
    return render_partial.blocks.block(
        block,
        getattr(render_partial.blocks, block.template)(block)
    )


@template_global
def render_template_block(block_name):
    return render_partial.blocks.template_block(block_name)


@template_global
def render_blocks(blocks):
    return render_partial.blocks.blocks(blocks)
