import os
import web
import json
import mimetypes
import random
import string
from base import db
from modules.utils import dthandler
from modules.translation import _
from config import config


def create_document(document):
    """Creates new document and saves upload"""

    parent = get_document_by_id(data.parent_id)

    document.update(
        ids=parent.ids + "," + str(parent.id),
        level=parent.level + 1,
        position=int(document.position),
        parent_id=int(parent_id),
        created_at=web.SQLLiteral("CURRENT_TIMESTAMP"),
        user_id=auth.get_user().id,
        is_published=True, #True for the new documents
    )

    if document.type == "folder":
        del document["upload"]
        if not document.title:
            document.title = _("Untitled Folder")
    else:
        upload = document.pop("upload")
        try:
            mimetype, encoding = mimetypes.guess_type(upload.filename)
            filename, filesize = save_document(upload.file)
            document.update(
                title=document.title or os.path.splitext(upload.filename)[0],
                filename=filename,
                extension=os.path.splitext(f.filename)[1].lower(),
                mimetype=mimetype,
                type="image" if "image" in mimetype else "document",
                filesize=filesize,
            )
        except:
            raise flash.error(_("File upload error."))

    # Shift positions to free the space to insert document
    db.update(
        "documents",
        where="parent_id = $parent_id AND position >= $position AND "
              "NOT is_deleted",
        vars=document,
        position=web.SQLLiteral("position + 1"),
    )

    document.id = db.insert("documents", **document)

    # TODO: fix created_at
    return document


def update_document_by_id(document_id, data):

    document = get_document_by_id(document_id)
    parent = get_document_by_id(data.parent_id)

    data.update(
        ids=parent.ids + "," + str(parent.id),
        level=parent.level + 1,
        position=int(data.position),
        parent_id=int(parent_id),
        updated_at=web.SQLLiteral("CURRENT_TIMESTAMP"),
    )

    # Cannot delete system files and folders
    if document.is_system:
        raise flash.error(
            _("Cannot edit or delete system files and folders."))

    # TODO: wrap the code below in transaction
    # TODO: custom input field that returns integer value
    if data.position != document.position or data.parent_id != document.parent_id:
        # Collapse positions
        db.update(
            "documents",
            where="parent_id = $parent_id AND position > $position AND "
                  "NOT is_deleted",
            vars=document,
            position=web.SQLLiteral("position - 1"),
        )
        # Shift positions to free the space to insert document
        db.update(
            "documents",
            where="parent_id = $parent_id AND position >= $position AND "
                  "NOT is_deleted",
            vars=data,
            position=web.SQLLiteral("position + 1"),
        )
        # TODO: recursively update ids and level for inner blocks

    # Cannot change documents type and file
    del data["type"]
    del data["upload"]

    db.update(
        "documents",
        where="id = $document_id",
        vars=locals(),
        **data)

    # Update document with data
    # TODO: fix updated_at
    document.update(data)

    return document


def delete_document_by_id(document_id):
    document = get_document_by_id(document_id)

    # cannot delete system files and folders
    if document.is_system:
        raise flash.error(
            _("Cannot edit or delete system files and folders."))

    # Collapse positions
    db.update(
        "documents",
        where="parent_id = $parent_id AND position > $position AND "
              "NOT is_deleted",
        vars=document,
        position=web.SQLLiteral("position - 1"),
    )

    # delete recursively
    return delete_document_tree(document)


def delete_document_tree(document):
    """
        Recursively deletes document tree branch.
        Ignores is_system flag, deletes everything.
    """
    db.update("documents", where="id = $document_id AND NOT is_deleted",
              vars=document, is_deleted=1)
    if document.type == "folder":
        for doc in db.select("documents", what="id, type",
                             where="parent_id = $document_id AND NOT is_deleted",
                             vars=locals()):
            delete_document_tree(doc)
    return document


def get_document_path(document):
    return db.select(
        "documents",
        vars=document,
        where="id in $ids AND NOT is_deleted",
    ).list() if document.ids else []


def get_document_by_id(document_id):
    return db.select(
        "documents",
        locals(),
        where="id = $document_id AND NOT is_deleted",
        limit=1,
    )[0]


def get_document_by_filename(filename):
    return db.select(
        "documents",
        locals(),
        where="filename = $filename AND NOT is_deleted",
        limit=1,
    )[0]


def get_documents_by_parent_id(parent_id, type=None):
    """Select and return documents from parent folder"""
    #TODO: filter by type
    return db.select("documents", locals(),
                     where="parent_id = $parent_id AND NOT is_deleted",
                     order="position ASC").list()


def document_to_json(document):
    return json.dumps(document, default=dthandler, sort_keys=True, indent=2)


def documents_to_json(documents):
    return json.dumps(documents, default=dthandler, sort_keys=True, indent=2)


def rem_file(filename):
    if os.path.exists(filename):
        os.unlink(filename)


def delete_file(filename):
    rem_file(os.path.join(config.upload_dir, filename + ".jpg"))
    rem_file(os.path.join(config.upload_dir, filename + "_tmp.jpg"))
    for size in config.image.keys():
        rem_file(os.path.join(config.static_dir, filename +
                              "_" + size + ".jpg"))


def save_document(f):
    """Saves file and returns filename with path from upload folder"""
    prefix = datetime.datetime.now().strftime("%Y/%m")
    prefixname = None
    while prefixname is None or os.path.exists(
            os.path.join(config.upload_dir, prefix, prefixname)):
        prefixname = (
            os.path.join(
                prefix,
                ''.join(random.choice(string.ascii_letters + string.digits)
                        for x in range(5))
            )
        )

    folder = os.path.join(config.upload_dir, prefix)
    if not os.path.exists(folder):
        os.makedirs(folder)
    document_file = file(os.path.join(config.upload_dir, prefixname), 'w')

    while 1:
        buf = f.read(1024 * 8)
        if not buf:
            break
        document_file.write(buf)
    size = document_file.tell()
    document_file.close()
    return prefixname, size


def download_document(document):

    if not auth.has_role("admin", "editor", "user") and not document.is_published:
        raise flash.redirect(_("Cannot download this document"))

    web.header("Content-Disposition", "attachment; filename=%s" %
               slugify(document.title) + document.extension)
    web.header("Content-Type", document.mimetype)
    f = open(os.path.join(config.upload_dir, document.filename), 'rb')
    while 1:
        buf = f.read(1024 * 8)
        if not buf:
            break
        yield buf
