# coding: utf-8
import web
from config import config
from base import db, auth
from model.tree import create_tree_branch
import json
import shutil

if __name__ == "__main__":

    shutil.rmtree(config.upload_dir + "/*")
    shutil.rmtree(config.static_dir + "/i/*")

    schema_commands = open("schema.sql", "r").read().split(";")

    for cmd in schema_commands:
        if cmd.strip():
            db.query(cmd)

    data = web.storage(json.loads(open("data.json", "r").read()))

    now = web.db.SQLLiteral("CURRENT_TIMESTAMP")

    user = auth.create_user(
        web.config.email_from,
        **data.user
    )

    # System root folder
    db.insert(
        "documents",
        user_id=user.id,
        created_at=now,
        **data.documents_root
    )

    for p in data.pages:
        block = p.pop("block")
        page_id = db.insert(
            "pages",
            is_published=False,
            is_navigatable=True,
            user_id=user.id,
            created_at=now,
            **p
        )
        create_tree_branch(
            "blocks",
            block,
            page_id=page_id,
            user_id=user.id,
            is_published=True,
            created_at=now,
            published_at=now,
        )

    for block in data.template_blocks:
        create_tree_branch(
            "blocks",
            block,
            user_id=user.id,
            is_published=True,
            created_at=now,
            published_at=now,
        )
