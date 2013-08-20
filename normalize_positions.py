"""
This script normalizes positions for all pages
"""

from base import db
from models.pages import get_pages_by_parent_id


def normalize_positions(page_id):
    pages = get_pages_by_parent_id(page_id,
                                   with_auth_check=False,
                                   with_published_check=False)
    for position, p in enumerate(pages):
        print position
        db.update("pages", where="id = $id", vars=p, position=position + 1)
        normalize_positions(p.id)


if __name__ == "__main__":
    normalize_positions(1)
