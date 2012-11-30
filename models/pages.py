# coding: utf-8
import web
from base import db
from pytils.translit import slugify
from config import config
from models.tree import *


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


def join_path(path, slug=""):
    return web.cond(path.endswith("/"), path, path + "/") + slug


def unique_path(page, page_id=None):
    if str(page_id) == "1":
        return dict(path="/", slug="")
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
            test_slug = slug + "-" + str(i)
            i += 1
    except IndexError:
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
    db.update(
        "pages",
        where="parent_id = $parent_id AND position > $position AND "
              "NOT is_deleted",
        vars=page,
        position=web.SQLLiteral("position - 1"),
    )

    # Delete recursively
    return delete_tree_branch("pages", page)


def dropdown_pages(page, pages):
    return [(page.id, u"  " * page.level + u"• " + page.name)] + sum(
        [dropdown_pages(p, pages) for p in pages if p.parent_id == page.id],
        [],
    )


def load_page_data(page):
    web.ctx.page = page
    web.ctx.nav = web.storage(
        root=db.select(
            "pages",
            where="level=1 AND NOT is_deleted AND is_navigatable",
            order="position ASC").list(),
        children=db.select(
            "pages", page,
            where="parent_id=$id AND NOT is_deleted AND is_navigatable",
            order="position ASC").list(),
        siblings=db.select(
            "pages", page,
            where="parent_id=$parent_id AND NOT is_deleted AND is_navigatable",
            order="position ASC").list(),
        breadcrumbs=(db.select("pages",
                               where="id in (%s) AND NOT is_deleted" %
                               page.ids).list() + [page]
                     if page.ids else [])
    )
