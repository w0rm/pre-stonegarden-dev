"""
Logger class to log into database
"""


class Logger:

    def __init__(self, db, auth):
        self.db = db
        self.auth = auth

    def log(level, message, obj_type=None, obj_id=None):
        log = dict(
            locals(),
            created_at=web.SQLLiteral("CURRENT_TIMESTAMP"),
            ip=web.ctx.env.get('HTTP_X_FORWARDED_FOR', web.ctx.ip),
            browser=web.ctx.environ.get("HTTP_USER_AGENT", None),
        )
        user = auth.get_user()
        if user:
            log["user_id"] = user.id
        db.insert("logs", **log)

    def debug(*args, **keywords):
        self.log("debug", *args, **keywords)

    def info(*args, **keywords):
        self.log("info", *args, **keywords)

    def warning(*args, **keywords):
        self.log("warning", *args, **keywords)

    def error(*args, **keywords):
        self.log("error", *args, **keywords)
