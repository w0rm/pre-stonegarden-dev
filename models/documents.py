import os
import web
import json
from base import db
from modules.utils import dthandler
from config import config


def update_document_by_id(document_id, data):
    pass


def create_document(data):
    pass


def delete_document_by_id(document_id):
    pass


def get_documents_by_parent_id(parent_id, type=None):
    """Select and return documents"""
    return []


def documents_to_json(documents):
    return json.dumps(documents, default=dthandler, sort_keys=True, indent=2)


#TODO: review the code below:

def rem_file(filename):
    if os.path.exists(filename):
        os.unlink(filename)


def delete_file(filename):
    rem_file(os.path.join(config.upload_dir, filename + ".jpg"))
    rem_file(os.path.join(config.upload_dir, filename + "_tmp.jpg"))
    for size in config.image.keys():
        rem_file(os.path.join(config.static_dir, filename +
                              "_" + size + ".jpg"))


def delete_document(document):
    db.update("documents", where="id = $id AND NOT is_deleted",
              vars=document, is_deleted=1)
    if document.type == "folder":
        for doc in db.select("documents", document,
                             where="parent_id=$id AND NOT is_deleted"):
            delete_document(doc)


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
    web.header("Content-Disposition", "attachment; filename=%s" %
               slugify(document.title) + document.extension)
    web.header("Content-Type", document.mimetype)
    #web.header('Transfer-Encoding', 'chunked')
    f = open(os.path.join(config.upload_dir, document.filename), 'rb')
    while 1:
        buf = f.read(1024 * 8)
        if not buf:
            break
        yield buf
