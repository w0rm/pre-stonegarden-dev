"""
Logger class to log into database
"""
import web


class Logger:

    def __init__(self, db, auth):
        self.db = db
        self.auth = auth

    def log(self, level, message, obj_type=None, obj_id=None):
        log = dict(
            level=level,
            message=message,
            obj_id=obj_id,
            obj_type=obj_type,
            created_at=web.SQLLiteral("CURRENT_TIMESTAMP"),
            ip=web.ctx.env.get('HTTP_X_FORWARDED_FOR', web.ctx.ip),
            browser=web.ctx.environ.get("HTTP_USER_AGENT", None),
        )
        user = self.auth.get_user()
        if user:
            log["user_id"] = user.id
        self.db.insert("logs", **log)

    def debug(self, *args, **keywords):
        self.log("debug", *args, **keywords)

    def info(self, *args, **keywords):
        self.log("info", *args, **keywords)

    def warning(self, *args, **keywords):
        self.log("warning", *args, **keywords)

    def error(self, *args, **keywords):
        self.log("error", *args, **keywords)
