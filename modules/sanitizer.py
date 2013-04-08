import re
from urlparse import urljoin
from config import config
from BeautifulSoup import BeautifulSoup, Comment

rjs = r'[\s]*(&#x.{1,7})?'.join(list('javascript:'))
rvb = r'[\s]*(&#x.{1,7})?'.join(list('vbscript:'))
re_scripts = re.compile('(%s)|(%s)' % (rjs, rvb), re.IGNORECASE)

def sanitize(value, cfg=None, base_url=None):
    if cfg is None:
        cfg = config.sanitizer
    if value is None:
        return value
    urlAttrs = 'href src'.split() # Attributes which should have a URL
    soup = BeautifulSoup(value)
    for comment in soup.findAll(text=lambda text: isinstance(text, Comment)):
        comment.extract() # Get rid of comments
    for tag in soup.findAll(True):
        if tag.name in cfg["replacements"]:
            tag.name = cfg["replacements"][tag.name]
        elif tag.name not in cfg["allowed_elements"]:
            tag.hidden = True
        attrs = tag.attrs
        tag.attrs = []
        for attr, val in attrs:
            if attr in cfg["allowed_attributes"].get(tag.name, []) or attr in cfg["allowed_attributes"].get("*", []):
                val = re_scripts.sub('', val) # Remove scripts (vbs & js)
                if attr in urlAttrs:
                    val = urljoin(base_url, val) # Calculate the absolute url
                tag.attrs.append((attr, val))
    return soup.renderContents().decode('utf8')

