# coding: utf-8
# Flash class for messaging on site
import web
import json


class Flash:

    def render(self):
        if not self.is_empty():
            return ('<div class="flash" data-template="%(status)s">'
                    '%(message)s</div>' % dict(web.ctx.session.pop("message")))

    def redirect(self, flash, link=None, status="info"):
        if link is None:
            link = web.ctx.env.get('HTTP_REFERER', '/')
        self.set(flash, status)
        if web.ctx.env.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest':
            return web.HTTPError(
                "400 Bad Request",
                {'Content-Type': 'application/json'},
                json.dumps({"redirect": link}))
        else:
            return web.seeother(link)

    def to_json(self):
        return web.ctx.session.pop("message")

    def set(self, message, status="info"):
        web.ctx.session.message = web.storage(message=message, status=status)

    def is_empty(self):
        return not web.ctx.session.get("message")

    def error(self, flash, status="error"):
        if web.ctx.env.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest':
            return web.HTTPError(
                "400 Bad Request",
                {'Content-Type': 'text/html'},
                flash)
        else:
            self.set(flash, status)
            return web.seeother(web.ctx.env.get('HTTP_REFERER', '/'))
