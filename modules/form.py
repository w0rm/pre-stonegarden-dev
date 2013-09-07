# coding: utf-8

import web
import datetime
import re
import json
from dateutil import parser
from translation import _, N_
from itertools import groupby


class ValidationError(web.HTTPError):
    """`412 Precondition Failed` error."""

    headers = {'Content-Type': 'text/html'}

    def __init__(self, message, headers=None):
        status = "412 Precondition Failed"
        web.HTTPError.__init__(self, status, headers or self.headers,
                               unicode(message))


class ApiForm(web.form.Form):

    def errors_to_json(self):

        result = web.storage(errors={})
        if self.note:
            result.errors["_form"] = web.storage(
                note=_(self.note)
            )
        for i in self.inputs:
            if i.note:
                result.errors[i.name] = web.storage(
                    description=_(i.description),
                    note=_(i.note),
                )
        # {errors:{"name": {description: "", note: ""}}, note:""}
        return json.dumps(result, indent=2)

    def validation_error(self):
        return ValidationError(
            self.errors_to_json(),
            {"Content-Type": "application/json"}
        )


# TODO: render all forms by parts in templates
class Form(web.form.Form):

    def rendernote(self, note):
        return u""

    def label_for(self, control, **attrs):
        """Renders label for input"""
        i = self[control]

        if 'class_' in attrs:
            attrs['class'] = attrs['class_']
            del attrs['class_']

        return (u'<label for="%s" %s>%s</label>' %
                (i.id, web.form.AttributeList(attrs), _(i.description)))

    def error_class_for(self, *controls):
        """Outputs error css class for one of controls"""
        for c in controls:
            if self[c].note:
                return "error"
        return ""

    def render_errors(self):
        """Renders errors block"""
        out = []
        out_errors = []
        errors = ((i.description, i.note) for i in self.inputs if i.note)
        errors = sorted(errors, key=lambda x: x[1])
        out.append('<div class="alert-box alert">')
        for err, fields in groupby(errors, key=lambda x: x[1]):
            out_errors.append(
                u", ".join(_(f[0]) for f in fields) +
                u": " +
                _(err) +
                ". "
            )
        if self.note:
            out_errors.append(self.note)
        out.append("".join(out_errors))
        out.append("</div>")
        return ''.join(out)


class Textbox(web.form.Textbox):

    def render(self):
        attrs = self.attrs.copy()
        attrs['type'] = self.get_type()
        if "placeholder" in attrs:
            attrs["placeholder"] = _(attrs["placeholder"])
        if self.value is not None:
            attrs['value'] = self.value
        attrs['name'] = self.name
        return u'<input %s>' % attrs


class Password(Textbox):

    def get_type(self):
        return "password"


class Searchbox(Textbox):

    def get_type(self):
        return "search"


class Hidden(web.form.Hidden):

    def render(self):
        attrs = self.attrs.copy()
        if attrs.get('id', True) is None:
            del attrs['id']
        attrs['type'] = self.get_type()
        if self.value is not None:
            attrs['value'] = self.value
        attrs['name'] = self.name
        return '<input %s/>' % attrs


class Dropdown(web.form.Dropdown):

    def render(self):
        attrs = self.attrs.copy()
        attrs['name'] = self.name

        x = '<select %s>\n' % attrs

        for arg in self.args:
            if isinstance(arg, (tuple, list)):
                value, desc = arg
            else:
                value, desc = arg, arg

            if (str(self.value) == str(value) or
                    isinstance(self.value, list) and value in self.value):
                select_p = ' selected="selected"'
            else:
                select_p = ''
            x += ('  <option%s value="%s">%s</option>\n' %
                  (select_p, web.net.websafe(value), web.net.websafe(_(desc))))

        x += '</select>\n'
        return x


class Checkbox(web.form.Checkbox):

    def set_value(self, value):
        if value in ("0", "false"):
            self.checked = False
        else:
            self.checked = bool(value)


class Textarea(web.form.Input):

    def render(self):
        attrs = self.attrs.copy()
        attrs['name'] = self.name
        if "placeholder" in attrs:
            attrs["placeholder"] = _(attrs["placeholder"])
        value = web.net.websafe(self.value or '')
        return '<textarea %s>%s</textarea>' % (attrs, value)


class Radio(web.form.Radio):

    def render(self):
        x = ''
        for arg in self.args:
            if isinstance(arg, (tuple, list)):
                value, desc = arg
            else:
                value, desc = arg, arg
            attrs = self.attrs.copy()
            attrs['name'] = self.name
            attrs['type'] = 'radio'
            attrs['value'] = value
            attrs['id'] = attrs['id'] + "_" + value
            if self.value == value:
                attrs['checked'] = 'checked'
            x += '<label class="after">'
            x += '<input %s/> %s' % (attrs, web.net.websafe(desc))
            x += '</label>'
        return x


class DateInput(Textbox):

    def get_value(self):
        try:
            if not self.value:
                return None
            elif type(self.value) in (datetime.datetime, datetime.date):
                return self.value
            else:
                return parser.parse(self.value)
        except:
            return None


class EmailInput(Textbox):

    def get_type(self):
        return 'email'

    def get_value(self):
        try:
            return self.value.strip().lower()
        except:
            return None


notnull = web.form.Validator(N_("Cannot be empty."), bool)
validPassword = web.form.Validator(
    N_("From 6 to 180 characters"),
    lambda x: (x and len(x) >= 6 and len(x) <= 180)
)
passwordMatch = web.form.Validator(
    N_("Password and confirmation do not match."),
    lambda form: form.password == form.password2
)
validEmail = web.form.regexp(
    r"^\s*[a-zA-Z0-9._%\-\+]+@[a-zA-Z0-9._%-]+.[a-zA-Z]{2,6}\s*$",
    N_("Incorrect email.")
)
price_regexp = re.compile(r"^\s*\d{1,11}([.,]\d{1,3})?\s*$")


def valid_date(code):
    if code is None or type(code) in (datetime.datetime, datetime.date):
        return True
    try:
        parser.parse(code)
        return True
    except:
        return False

validDate = web.form.Validator(N_("Incorrect date value."), valid_date)
