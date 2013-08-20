# coding: utf-8

import web
import json
import re
from base import db, auth, flash
from modules.utils import dthandler
from template import smarty, sanitize, template_global, render_partial
from models.documents import document_src

LETTERS = u"АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЫЭЮЯ"

LATE_LETTERS_RE = re.compile(
    ur"""
        (?P<first_letter>[%s])
        \s*
        (?:-(?P<last_letter>[%s]))?
        \s*
        (?:\((?P<gender>[^)]+)\))?
        (\s*,\s*|$)
    """ % (LETTERS, LETTERS),
    re.X | re.U | re.I
)


def expand_letters(short_letters):
    if not short_letters:
        return None
    letters = set()
    for m in LATE_LETTERS_RE.finditer(short_letters.upper()):
        first_letter = m.group("first_letter")
        last_letter = m.group("last_letter")
        if last_letter:
            first_index = LETTERS.find(first_letter)
            last_index = LETTERS.find(last_letter)
            if last_index > first_index:
                for letter in LETTERS[first_index:last_index + 1]:
                    letters.add(letter)
        else:
            letters.add(first_letter)

    letters = sorted(list(letters))
    return ",".join(letters) if letters else None


def create_notary(notary):
    """Creates new notary"""

    if not notary.get("office_image_id"):
        notary["office_image_id"] = None

    if not notary.get("notary_image_id"):
        notary["notary_image_id"] = None

    notary.update(
        created_at=web.SQLLiteral("CURRENT_TIMESTAMP"),
        description_cached=smarty(sanitize(notary.description)),
        legacy_letters_cached=expand_letters(notary.legacy_letters),
    )
    notary.id = db.insert("notaries", **notary)
    return notary


def update_notary_by_id(notary_id, data):
    """Update notary by id"""
    notary = get_notary_by_id(notary_id)

    if not data.get("office_image_id"):
        data["office_image_id"] = None

    if not data.get("notary_image_id"):
        data["notary_image_id"] = None

    data.update(
        updated_at=web.SQLLiteral("CURRENT_TIMESTAMP"),
        description_cached=smarty(sanitize(data.description)),
        legacy_letters_cached=expand_letters(data.legacy_letters),
    )
    db.update(
        "notaries",
        where="id = $notary_id",
        vars=locals(),
        **data)
    notary.update(data)
    return notary


def delete_notary_by_id(notary_id):
    """Delete notary by id"""
    notary = get_notary_by_id(notary_id)
    db.update(
        "notaries",
        where="id = $id AND NOT is_deleted",
        vars=notary,
        is_deleted=1,
        deleted_at=web.SQLLiteral("CURRENT_TIMESTAMP"),
    )
    return notary


def get_notary_by_id(notary_id):
    """Get notary by id"""
    return db.select(
        "notaries",
        locals(),
        where="id = $notary_id AND NOT is_deleted",
        limit=1,
    )[0]


@template_global
def get_notaries(region_id=None, with_images=False):
    """Get notary by region_id"""
    where = "NOT n.is_deleted"
    join_fields = joins = ""
    if region_id is not None:
        where += " AND n.region_id = $region_id"
    if with_images:
        joins = """
        LEFT JOIN documents d1 ON d1.id = n.notary_image_id AND
            NOT d1.is_deleted
        LEFT JOIN documents d2 ON d2.id = n.office_image_id AND
            NOT d2.is_deleted
        """
        join_fields = """,
        d1.filename AS notary_image_filename,
        d1.extension AS notary_image_extension,
        d1.sizes AS notary_image_sizes,
        d2.filename AS office_image_filename,
        d2.extension AS office_image_extension,
        d2.sizes AS office_image_sizes
        """

    notaries = db.query(
        """
        SELECT n.* %(join_fields)s
        FROM notaries n
        %(joins)s
        WHERE
        %(where)s
        ORDER BY n.title ASC
        """ % locals(),
        vars=locals()
    ).list()

    if with_images:
        for n in notaries:
            for img in "notary_image", "office_image":
                filename = n.pop(img + "_filename")
                if filename:
                    n[img] = document_src(
                        web.storage(
                            id=n.pop(img + "_id"),
                            filename=filename,
                            extension=n.pop(img + "_extension"),
                            sizes=n.pop(img + "_sizes"),
                            type="image"
                        )
                    )
                else:
                    n[img] = None

    return notaries


def notary_to_json(notary):
    return json.dumps(notary, default=dthandler)


def notaries_to_json(notaries):
    return json.dumps(notaries, default=dthandler)


def notary_to_map(notary):
    return web.storage(
        title=notary.title,
        longitude=notary.longitude,
        latitude=notary.latitude,
        phone=notary.phone,
        address=notary.address,
        region_id=notary.region_id,
        description=notary.description_cached,
        office_image=notary.get("office_image", None),
        legacy_letters=notary.legacy_letters,
        legacy_letters_cached=(notary.legacy_letters_cached or "").split(","),
        late_days=(notary.late_days or "").split(","),
    )


@template_global
def notaries_to_map_json(notaries):
    return json.dumps([notary_to_map(n) for n in notaries],
                      default=dthandler)
