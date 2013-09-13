#!/usr/bin/env python
"""
This is the main executable file
that runs application in development server or wsgi mode
"""
# Add current directory to path
import os
import sys
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from config import config
from base import create_application

# Application initialization
app = create_application()

# Display pretty error pages in production
if config.environment == 'production':
    import web
    import template
    #app.internalerror = web.emailerrors(
    #    config.email['email_from'],
    #    lambda: web.internalerror(template.render.site.e500()),
    #)
    app.internalerror = lambda: web.internalerror(template.render.site.e500())
    app.notfound = lambda: web.notfound(template.render.site.e404())

if __name__ == '__main__':
    if config.environment != 'test':
        app.run(port=config.port)
else:
    application = app.wsgifunc()
