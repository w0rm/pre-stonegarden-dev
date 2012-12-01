# coding: utf-8
import web
import json
from base import db
from pytils.translit import slugify
from config import config
from models.tree import *
from modules.utils import dthandler
from template import smarty, sanitize


def get_page_by_id(page_id):
    return db.select(
        "pages",
        locals(),
        where="id = $page_id AND NOT is_deleted",
        limit=1)[0]


def get_pages_by_parent_id(parent_id):
    return db.select(
        "pages",
        locals(),
        where="parent_id=$parent_id AND NOT is_deleted"
    ).list()


def get_pages_in_tree_order():
    all_pages = db.select("pages", where="NOT is_deleted",
                          order="level, position").list()
    root = next(p for p in pages if p.parent_id is None)
    return order_pages_tree(root, all_pages)


def order_pages_tree(root, pages):
    """Returns list of pages sorted in a tree order
       root
       -- (1) subpage
       ---- (1) subsubpage
       ------ (1) subsubsubpage
       ------ (2) subsubsubpage
       ---- (2) subsubpage
       -- (2) subpage
       -- (3) subpage
    """
    return [root] + sum(
        [order_pages_tree(p, pages) for p in pages if p.parent_id == page.id],
        [],
    )


def create_page(page):
    """Creates new page and pageblock"""

    page.update(unique_path(page))

    page.update(
        user_id=auth.get_user().id,
        created_at=web.SQLLiteral("CURRENT_TIMESTAMP"),
        description_cached=smarty(sanitize(page.description)),
    )

    if page.position:
        page.position = int(page.position)
        # Shift positions to free the space to insert page
        expand_tree_siblings("pages", page)
    else:
        page.position = get_last_position("pages", page.parent_id)

    page.id = db.insert("pages", **page)

    # Generate pages initial blocks stucture
    page_block = config.page_types[page.type]["block"]
    create_tree_branch(
        "blocks",
        page_block,
        page_id=page.id,
        user_id=auth.get_user().id,
        is_published=True,
        is_system=True,
        created_at=web.SQLLiteral("CURRENT_TIMESTAMP"),
        published_at=web.SQLLiteral("CURRENT_TIMESTAMP"),
    )

    return page


def update_page_by_id(page_id, data):

    page = get_page_by_id(page_id)

    # Cannot change page type
    del data["type"]

    if page.is_system:
        # Cannot edit system
        del data["slug"]
        del data["path"]
        # position can be changed, but not parent_id
        data.parent_id = page.parent_id
    else:
        data.update(unique_path(data, page_id))

    data.update(
        parent_id=int(data.parent_id),
        position=int(data.position),
        description_cached=smarty(sanitize(data.description)),
        updated_at=web.SQLLiteral("CURRENT_TIMESTAMP"),
    )

    with db.transaction():

        # Transact changes to positions
        if (page.position != page.position or
                page.parent_id != page.parent_id):

            # Collapse positions for the removed document
            collapse_tree_siblings("pages", data)

            # Shift positions to free the space to insert document
            expand_tree_siblings("pages", data)

        db.update(
            "pages",
            where="id = $page_id",
            vars=locals(),
            **data)

    page.update(data)


def join_path(path, slug=""):
    """Appends slug to path"""
    return web.cond(path.endswith("/"), path, path + "/") + slug


def unique_path(page, page_id=None):
    """Makes unique_path for page, returns new path and slug.
       Provided @page_id means do not check against self"""
    slug = slugify(page.slug or page.name)
    parent_page = db.select("pages", page, where="id=$parent_id")[0]
    test_slug, i = slug, 1
    try:
        while True:
            if not test_slug in config.reserved:
                new_path = join_path(parent_page.path, test_slug)
                test = db.select(
                    "pages",
                    locals(),
                    where=("path=$new_path" +
                           web.cond(page_id, " AND NOT id=$page_id", "")),
                )[0]
            test_slug = "%s-%d" % (slug, i)
            i += 1
    except IndexError:
        # Page with test_slug doesn't exist — take this slug
        if parent_page.ids:
            ids = parent_page.ids + "," + str(parent_page.id)
        else:
            ids = parent_page.id
        return dict(
            path=new_path,
            slug=test_slug,
            ids=ids,
            level=parent_page.level + 1)


def update_branch(parent_id):
    """Recursively updates branch setting correct ids, level, slug and path"""
    for page in get_pages_by_parent_id(parent_id):
        db.update(
            "pages", where="id=$id", vars=page,
            **unique_path(page, page.id))
        update_branch(page.id)


def delete_page_by_id(page_id):

    page = get_page_by_id(page_id)

    if page.id == 1 or page.is_system:
        raise flash.error(_("Cannot delete root and system pages."))

    # Collapse positions
    collapse_tree_siblings("pages", page)

    # Delete recursively
    return delete_tree_branch("pages", page)


def load_page_data(page):
    web.ctx.page = page
    web.ctx.nav = web.storage(
        root=db.select(
            "pages",
            where="level=1 AND NOT is_deleted AND is_navigatable",
            order="position").list(),
        children=db.select(
            "pages", page,
            where="parent_id=$id AND NOT is_deleted AND is_navigatable",
            order="position").list(),
        siblings=db.select(
            "pages", page,
            where="parent_id=$parent_id AND NOT is_deleted AND is_navigatable",
            order="position").list(),
        breadcrumbs=(db.select("pages",
                               where="id in (%s) AND NOT is_deleted" %
                               page.ids).list() + [page]
                     if page.ids else [])
    )


def page_to_json(page):
    return json.dumps(page, default=dthandler,
                      sort_keys=True, indent=2)


def pages_to_json(pages):
    return json.dumps(pages, default=dthandler,
                      sort_keys=True, indent=2)
