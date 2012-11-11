# coding: utf-8
import web
from base import db


def get_page_by_id(page_id):
    return db.select(
        "pages",
        locals(),
        where="id = $page_id AND NOT is_deleted",
        limit=1)[0]


def load_navigation(page):
    web.ctx.nav = db.select(
        "pages",
        where="level=1 AND NOT is_deleted AND is_navigatable",
        order="position ASC").list()
    web.ctx.children = db.select(
        "pages", page,
        where="page_id=$id AND NOT is_deleted AND is_navigatable",
        order="position ASC").list()
    web.ctx.siblings = db.select(
        "pages", page,
        where="page_id=$page_id AND NOT is_deleted AND is_navigatable",
        order="position ASC").list()
    if page.level > 0:
        web.ctx.path = db.select(
            "pages",
            where="id in (%s) AND NOT is_deleted" % page.pages).list()
    else:
        web.ctx.path = []


def join_path(path, slug=""):
    return web.cond(path.endswith("/"), path, path + "/") + slug


def unique_path(page, page_id=None):
    if str(page_id) == "1":
        return dict(path="/", slug="")
    slug = slugify(page.slug or page.name)
    parent_page = db.select("pages", page, where="id=$page_id")[0]
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
        if parent_page.pages:
            pages = parent_page.pages + "," + str(parent_page.id)
        else:
            pages = parent_page.id
        return dict(
            path=new_path,
            slug=test_slug,
            pages=pages,
            level=parent_page.level + 1)


def update_branch(page_id):
    pages = db.select("pages", locals(),
                      where="page_id=$page_id AND NOT is_deleted")
    for page in pages:
        db.update("pages", where="id=$id", vars=page,
                  **unique_path(page, page.id))
        update_branch(page.id)


def delete_branch(page_id, deleted_at):
    if str(page_id) == "1":
        return
    for page in db.select("pages", locals(),
                          where="page_id=$page_id AND NOT is_deleted"):
        delete_branch(page.id, deleted_at)
    db.update("pages", where="id=$page_id AND NOT is_deleted", vars=locals(),
              is_deleted=True, deleted_at=deleted_at)


def dropdown_pages(page, pages):
    return [(page.id, u"  " * page.level + u"• " + page.name)] + sum(
        [dropdown_pages(p, pages) for p in pages if p.page_id == page.id],
        [],
    )
