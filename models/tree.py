"""Tree manipulation functions"""
import web
from base import db


def create_tree_branch(table_name, current_obj,
                       parent=None, position=1,
                       func=None,
                       **data):
    """Recursively creates tree branch"""
    obj = web.storage(current_obj.copy())

    children = obj.pop(table_name, [])

    obj.update(data)

    if parent:
        if parent.ids is None:
            obj.ids = str(parent.id)
        else:
            obj.ids = parent.ids + "," + str(parent.id)
        obj.update(
            parent_id=parent.id,
            level=parent.level + 1,
        )
    else:
        obj.update(ids=None, level=0)

    if func is not None:
        obj = func(obj, parent)

    obj.id = db.insert(table_name, position=position, **obj)

    for index, child in enumerate(children):
        create_tree_branch(table_name, child, obj,
                           index + 1, func,
                           **data)
    return obj


def get_last_position(table_name, parent_id):
    position = db.select(
        table_name,
        what="MAX(position) AS position",
        where="parent_id = $parent_id",
        vars=locals()
    )[0].position
    return (position or 0) + 1


def delete_tree_branch(table_name, parent_obj, func=None):
    """Recursively deletes document tree branch.
       Ignores is_system flag, deletes everything."""

    db.update(
        table_name,
        where="id = $id AND NOT is_deleted",
        vars=parent_obj,
        is_deleted=1,
        deleted_at=web.SQLLiteral("CURRENT_TIMESTAMP"),
    )

    if func is not None:
        func(parent_obj)

    for obj in db.select(table_name,
                         what="id",
                         where="parent_id = $id AND NOT is_deleted",
                         vars=parent_obj):
        delete_tree_branch(table_name, obj)

    return parent_obj


def collapse_tree_siblings(table_name, obj):
    """Collapses positions at @obj.position
       eg: if position = 4, then
           1 2 3 (4) [5 6 7 8 9] -> 1 2 3 (4) [4 5 6 7 8]
       @obj should then be deleted or moved away from its parent
    """
    db.update(
        table_name,
        where="parent_id = $parent_id AND position > $position AND "
              "NOT is_deleted",
        vars=obj,
        position=web.SQLLiteral("position - 1"),
    )
    return obj


def expand_tree_siblings(table_name, obj):
    """Expands positions to free the space for @obj insertion"""
    db.update(
        table_name,
        where="parent_id = $parent_id AND position >= $position AND "
              "NOT is_deleted",
        vars=obj,
        position=web.SQLLiteral("position + 1"),
    )
    return obj
