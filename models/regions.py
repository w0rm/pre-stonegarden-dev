import web
import json
from base import db, auth, flash
from modules.utils import dthandler
from template import smarty, sanitize, template_global, render_partial
from notaries import get_notaries


def create_region(region):
    """Creates new region"""
    region.update(
        created_at=web.SQLLiteral("CURRENT_TIMESTAMP"),
    )
    region.id = db.insert("regions", **region)
    return region


def update_region_by_id(region_id, data):
    """Update region by id"""
    region = get_region_by_id(region_id)
    data.update(
        updated_at=web.SQLLiteral("CURRENT_TIMESTAMP"),
    )
    db.update(
        "regions",
        where="id = $region_id",
        vars=locals(),
        **data)
    region.update(data)
    return region


def delete_region_by_id(region_id):
    """Delete region by id"""
    region = get_region_by_id(region_id)
    db.update(
        "regions",
        where="id = $id AND NOT is_deleted",
        vars=region,
        is_deleted=1,
        deleted_at=web.SQLLiteral("CURRENT_TIMESTAMP"),
    )
    return region


def get_region_by_id(region_id):
    """Get region by id"""
    return db.query(
        """
        SELECT r.*, count(n.id) as notaries_count FROM regions r
        LEFT JOIN notaries n ON n.region_id = r.id AND NOT n.is_deleted
        WHERE r.id = $region_id AND NOT r.is_deleted
        GROUP BY r.id
        ORDER BY notaries_count DESC, r.title ASC
        LIMIT 1
        """,
        vars=locals()
    )[0]


@template_global
def get_regions(with_notaries=False, with_images=True):
    """Get all regions"""
    regions = db.query(
        """
        SELECT r.*, count(n.id) as notaries_count FROM regions r
        LEFT JOIN notaries n ON n.region_id = r.id AND NOT n.is_deleted
        WHERE NOT r.is_deleted
        GROUP BY r.id
        ORDER BY notaries_count DESC, r.title ASC
        """
    ).list()
    if with_notaries:
        notaries = get_notaries(with_images=with_images)
        for r in regions:
            r.notaries = [n for n in notaries if n.region_id == r.id]
    return regions


def region_to_json(region):
    return json.dumps(region, default=dthandler)


def regions_to_json(regions):
    return json.dumps(regions, default=dthandler)
