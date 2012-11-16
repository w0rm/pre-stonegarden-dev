# coding: utf-8
import web
from config import config
from base import db, auth
import json

if __name__ == "__main__":

    data = web.storage(json.loads(open("data.json", "r").read()))

    now = web.db.SQLLiteral("CURRENT_TIMESTAMP")

    user = auth.create_user(
        web.config.email_from,
        **data.user
    )

    def insert_blocks(block, parent_id=None, page_id=None, level=0, ids=None):
        blocks = block.pop("blocks", None)
        block_id = db.insert(
            "blocks",
            user_id=user.id,
            created_at=now,
            page_id=page_id,
            level=level,
            parent_id=parent_id,
            ids=ids,
            is_published=True,
            created_at=now,
            published_at=now,
            **block
        )
        if ids is None:
            ids = str(block_id)
        else:
            ids += "," + str(block_id)
        if blocks:
            for b in blocks:
                insert_blocks(b, block_id, page_id, level + 1, ids)

    # System root folder
    db.insert(
        "documents",
        user_id=user.id,
        created_at=now,
        **data.documents_root
    )

    for p in data.pages:
        page_block = p.pop("block")
        page_id = db.insert(
            "pages",
            is_published=False,
            is_navigatable=True,
            user_id=user.id,
            created_at=now,
            **p
        )
        insert_blocks(page_block, page_id=page_id)

    for b in data.template_blocks:
        insert_blocks(b)
