from __future__ import unicode_literals
import os
import web
import json
import mimetypes
import random
import datetime
import string
from base import db, auth, flash
from modules.utils import dthandler
from modules.translation import _
from config import config
from template import asset_url, template_global
from pytils.translit import slugify
from models.tree import *

# Image resize
import Image
import ImageFilter
import shutil
from StringIO import StringIO
import ImageFile
ImageFile.MAXBLOCK = 1500 * 1500  # default is 64k


def create_document(document):
    """Creates new document and saves upload"""

    parent = get_document_by_id(document.parent_id)

    document.update(
        ids=(parent.ids or "") + "," + str(parent.id),
        level=parent.level + 1,
        parent_id=int(document.parent_id),
        created_at=web.SQLLiteral("CURRENT_TIMESTAMP"),
        user_id=auth.get_user().id,
        is_published=True,  # True for the new documents
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
            title, extension = os.path.splitext(upload.filename)
            document.update(
                title=document.title or title,
                filename=filename,
                extension=extension.lower(),
                mimetype=mimetype,
                type="image" if "image" in mimetype else "document",
                filesize=filesize,
            )
        except:
            raise flash.error(_("File upload error."))

    if document.position:
        document.position = int(document.position)
        # Shift positions to free the space to insert document
        expand_tree_siblings("documents", document)
    else:
        document.position = get_last_position("documents", document.parent_id)

    document.id = db.insert("documents", **document)

    # TODO: fix created_at
    return document


def update_document_by_id(document_id, data):

    document = get_document_by_id(document_id)

    # Cannot edit system files and folders
    if document.is_system:
        raise flash.error(
            _("Cannot edit or delete system files and folders."))

    parent = get_document_by_id(data.parent_id)

    # TODO: custom input field that returns integer value
    data.update(
        ids=(parent.ids or "") + "," + str(parent.id),
        level=parent.level + 1,
        position=int(data.position),
        parent_id=parent.id,
        updated_at=web.SQLLiteral("CURRENT_TIMESTAMP"),
    )

    with db.transaction():

        # Transact changes to positions
        if (data.position != document.position or
                data.parent_id != document.parent_id):

            # Collapse positions for the removed document
            collapse_tree_siblings("documents", document)

            # Shift positions to free the space to insert document
            expand_tree_siblings("documents", data)

        # Cannot change documents type and upload
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
    collapse_tree_siblings("documents", document)

    # Delete branch recursively
    return delete_tree_branch("documents", document)


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


def get_documents_by_parent_id(parent_id, document_type=None):
    """Select and return documents from parent folder
       optionally filtered by @document_type"""
    where = "parent_id = $parent_id AND NOT is_deleted"
    if document_type == "folder":
        where += " AND type = 'folder'"
    elif document_type in ("image", "document"):
        where += " AND type IN ('folder', '%s')" % document_type
    return db.select("documents", locals(), where=where,
                     order="position ASC").list()


def document_src(document):
    if document.type == "image":
        document.src = image_url(document, "t")
        document.sizes = dict(
            (size, image_url(document, size)) for size in ("s", "m", "l")
        )

    elif document.type == "document":
        document.src = "/uploads/" + document.filename
    return document


@template_global
def describe_extension(doc):
    if doc.filetype == "image":
        return _("Images")
    elif doc.filetype == "folder":
        return _("Folders")
    elif doc.extension in (".txt|.rtf|.rtf|.doc|.docx|.odt|"
                           ".odc|.odp|.pdf|.ppt|.xls|.xlsx"):
        return _("Documents")
    elif doc.extension in ".zip|.rar|.tar|.gz|.bz|.tgz|.arj|.7z":
        return _("Archives")
    else:
        return _("Files")


@template_global
def filesize(doc):
    return unicode((doc.filesize or 0) / 1024) + " " + _("kb")


def document_to_json(document):
    return json.dumps(document_src(document), default=dthandler,
                      sort_keys=True, indent=2)


def documents_to_json(documents):
    for document in documents:
        document_src(document)
    return json.dumps(documents, default=dthandler, sort_keys=True, indent=2)


def download_document(document):
    if (not auth.has_role("admin", "editor", "user") and
            not document.is_published):
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


def resize_image(image, size):
    original_name = os.path.join(config.upload_dir, image.filename)
    destination_name = os.path.join(
        config.static_dir,
        "i/" + image.filename + "_" + size + image.extension
    )
    resize_image_file(original_name, destination_name, size)
    sizes = set(image.sizes.split(",")) if image.sizes else set()
    sizes.add(size)
    image.sizes = ",".join(sizes)
    db.update("documents", where="id = $id", vars=image, sizes=image.sizes)
    return image


def image_url(image, size):
    if not size in config.image:
        size = "_"
    try:
        if not image.sizes or not size in image.sizes.split(","):
            resize_image(image, size)
        return asset_url("i/" + image.filename + "_" + size + image.extension,
                         version=False)
    except:
        pass
    return asset_url("img/broken_" + size + ".png")


# File operations

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


def rem_file(filename):
    if os.path.exists(filename):
        os.unlink(filename)


def delete_file(filename):
    # rem_file(os.path.join(config.upload_dir, filename))
    for size in config.image.keys():
        rem_file(os.path.join(config.static_dir,
                              filename + "_" + size + extension))


def resize_image_file(original_name, destination, prefix):
    (dst_width, dst_height, crop, sharp,
     watermark, quality, progressive) = config.image[prefix]
    if dst_width and dst_height:
        img = Image.open(original_name)
        src_width, src_height = img.size
        src_ratio = float(src_width) / float(src_height)
        dst_ratio = float(dst_width) / float(dst_height)
        if crop:
            if dst_ratio < src_ratio:
                crop_height = src_height
                crop_width = crop_height * dst_ratio
                x_offset = float(src_width - crop_width) / 2
                y_offset = 0
            else:
                crop_width = src_width
                crop_height = crop_width / dst_ratio
                x_offset = 0
                y_offset = float(src_height - crop_height) / 3
            img = img.crop(
                (
                    x_offset,
                    y_offset,
                    x_offset + int(crop_width),
                    y_offset + int(crop_height)
                ),
            )
            img = img.resize((dst_width, dst_height), Image.ANTIALIAS)
        elif src_width > dst_width and src_height > dst_height:
            if dst_ratio > src_ratio:
                img = img.resize(
                    (
                        int((float(dst_height) * src_ratio) + 0.5),
                        dst_height
                    ),
                    Image.ANTIALIAS
                )
            else:
                img = img.resize(
                    (
                        dst_width,
                        int((float(dst_width) / src_ratio) + 0.5)
                    ),
                    Image.ANTIALIAS
                )
        folder = os.path.dirname(destination)
        if not os.path.exists(folder):
            os.makedirs(folder)
        rem_file(destination)
        if destination.endswith("jpg"):
            if sharp:
                img = img.filter(ImageFilter.DETAIL)
            if watermark:
                mark = Image.open(os.path.join(config.static_dir,
                                               "/img/watermark.png"))
                w1, h1 = img.size
                w2, h2 = mark.size
                img.paste(mark, (w1 - w2, h1 - h2), mark)
            img.save(destination, "JPEG", quality=quality,
                     optimize=True, progressive=progressive)
        else:
            img.save(destination)
    else:
        shutil.copy(original_name, destination)
