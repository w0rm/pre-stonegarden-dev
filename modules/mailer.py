import json
import web


class Mailer:
    """Store for saving sent messages in database
    Needs a table with the following columns:
        Column("id", Integer, primary_key=True),
        Column("message", Text), # message in JSON
        Column("created_at", TIMESTAMP)
        Column("sent_at", TIMESTAMP)
    """

    def __init__(self, db, send_mail):
        self.db = db
        self.send_mail = send_mail
        self.email_form = web.config.email_from

    def send(self, to, body, reply_to=None, send_now=False, is_secure=False):
        subject = body.get('Subject').strip()
        headers = dict(body)
        del headers['__body__']
        if 'ContentType' in headers:
            headers['Content-Type'] = headers['ContentType'].strip()
            del headers['ContentType']
        if reply_to:
            headers['Reply-To'] = reply_to
        message = dict(
            to=to,
            subject=subject,
            headers=headers,
            body=unicode(body),
            is_secure=is_secure,
        )
        message_id = self.db.insert(
            "messages",
            message=json.dumps(message),
            created_at=web.SQLLiteral("CURRENT_TIMESTAMP"),
        )
        if send_now:
            self.sendmail(message_id, message)

    def sendmail(self, message_id, message=None):
        if not message:
            try:
                message = self.db.select(
                    "messages", locals(),
                    where="id = $message_id AND sent_at IS NULL",
                    what="message")[0].message
                message = web.storage(json.loads(message))
            except IndexError:
                return  # maybe we need to raise error
        updates = dict(sent_at=web.SQLLiteral("CURRENT_TIMESTAMP"))
        if self.send_mail:
            web.utils.sendmail(
                self.email_form,
                message.to,
                message.subject,
                message.body,
                message.headers
            )
            if message.is_secure:
                message.body = ""
                updates["message"] = json.dumps(message)
        self.db.update("messages", where="id=$message_id",
                       vars={'message_id': message_id}, **updates)
