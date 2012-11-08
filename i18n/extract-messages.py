#!/usr/bin/python
# coding: utf-8
"""
    Extract Messages
    ~~~~~~~~~~~~~~~~
    Extract messages into a PO-Template.
    :copyright: 2008 by Armin Ronacher.
    :license: GNU GPL.
    
    pybabel init -i i18n/messages.pot -d i18n/ -l ru
    pybabel init -i i18n/messages.pot -d i18n/ -l en
    pybabel update -i i18n/messages.pot -d i18n/ 
    pybabel compile  -d i18n/ -f --statistics
    
"""
from os import path, makedirs
from babel.messages import Catalog
from babel.messages.extract import extract_from_dir, extract_python, DEFAULT_KEYWORDS
from babel.messages.pofile import write_po
from web.template import Template
import StringIO
from itertools import chain
import sys
sys.path.append("..")
BUGS_ADDRESS = "andreivk@gmail.com"
COPYRIGHT = "Andrey Kuzmin"

PY_METHODS = [
    ("**.py", "python"),
    ("templates/html/**.html", "extract-messages:extract_webpy"),
    ("templates/html/**.xml", "extract-messages:extract_webpy"),
    ("templates/html/**.txt", "extract-messages:extract_webpy"),
]

PY_KEYWORDS = {
    "N_": None,
    "_": None,
    "n_": (1, 2),
}

JS_KEYWORDS = {
    "N_": None,
    "t_": None,
    "n_": (1, 2),
}

COMMENT_TAGS = []

def extract_webpy(fileobj, keywords, comment_tags, options):
    """Extract messages from webpy templates files.
    :param fileobj: the file-like object the messages should be extracted
                    from
    :param keywords: a list of keywords (i.e. function names) that should
                     be recognized as translation functions
    :param comment_tags: a list of translator tags to search for and
                         include in the results
    :param options: a dictionary of additional options (optional)
    :return: an iterator over ``(lineno, funcname, message, comments)``
             tuples
    :rtype: ``iterator``
    """

    code = Template.generate_code(fileobj.read().decode("utf-8"), fileobj.name)
    return extract_python(StringIO.StringIO(code), keywords, comment_tags, options)


def strip_path(filename, base):
    filename = path.normpath(path.join(base, filename))
    return filename[len(path.commonprefix([
        filename, path.dirname(base)])):].lstrip(path.sep)


def main():
    print "Extracting core strings"
    root = path.abspath(path.join(path.dirname(__file__), '..'))
    catalog = Catalog(msgid_bugs_address=BUGS_ADDRESS, copyright_holder=COPYRIGHT, charset="utf-8")

    def callback(filename, method, options):
        if method != "ignore":
            print strip_path(filename, root)

    extracted_py = extract_from_dir(root, PY_METHODS, {}, PY_KEYWORDS,
                                COMMENT_TAGS, callback=callback,
                                strip_comment_tags=True)
    
    # TODO: extract only from unminified files
    extracted_js = extract_from_dir(root, [("static/js/*.js", "javascript")], {}, JS_KEYWORDS,
                                COMMENT_TAGS, callback=callback,
                                strip_comment_tags=True)

    for filename, lineno, message, comments in chain(extracted_py, extracted_js):
        catalog.add(message, None, [(strip_path(filename, root), lineno)],
                    auto_comments=comments)

    output_path = path.join(root, "i18n")
    if not path.isdir(output_path):
        makedirs(output_path)

    f = file(path.join(output_path, "messages.pot"), "w")
    try:
        write_po(f, catalog, width=79)
    finally:
        f.close()

    print "All done."


if __name__ == "__main__":
    main()
