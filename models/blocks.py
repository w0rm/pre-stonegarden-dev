from base import db


def get_block_by_id(block_id):
    return db.select(
        "blocks",
        locals(),
        where="$block_id = id",
        limit=1,
    )[0]
