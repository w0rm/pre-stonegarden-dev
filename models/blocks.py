import web
import json
from base import db
from modules.utils import dthandler
from template import render_partial
from models.pages import load_navigation, get_page_by_id


def get_block_by_id(block_id):
    return db.select(
        "blocks",
        locals(),
        where="$block_id = id",
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
