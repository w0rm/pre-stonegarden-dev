# coding: utf-8

import web
import datetime
import re
from dateutil import parser
from translation import _
from itertools import groupby


class ValidationError(web.HTTPError):
    """`412 Precondition Failed` error."""

    headers = {'Content-Type': 'text/html'}

    def __init__(self, message, headers=None):
        status = "412 Precondition Failed"
        web.HTTPError.__init__(self, status, headers or self.headers,
                               unicode(message))


class Form(web.form.Form, object):

    def rendernote(self, note):
        if note:
            return '<span class="wrong">%s</span>' % _(note)

    def render_input(self, i):
        out = []
        out.append(i.pre)
        if not isinstance(i, CheckboxList):
            if i.note:
                out.append('<p class="wrong">')
            else:
                out.append('<p>')
            if isinstance(i, web.form.Checkbox):
                out.append('<label class="after">')
                out.append(i.render())
                out.append(' %s</label>' % _(i.description))
            else:
                if not i.is_hidden() and i.description:
                    out.append('<label for="%s">%s</label>' % (i.id, _(i.description)))
                out.append(i.render())
            if i.note:
                out.append(self.rendernote(i.note))
            out.append('</p>')
        else:
            if i.note:
                out.append('<p class="wrong">')
            else:
                out.append('<p>')
            if i.description:
                out.append('<label for="%s">%s</label>' % (i.id, _(i.description)))
            if i.note:
                out.append(self.rendernote(i.note))
            out.append('</p>')
            out.append(i.render())
        out.append(i.post)
        return ''.join(out)

    def render(self, names=None, x=None, y=None):
        out = []
        if self.note and not x:
            out.append('<p class="wrong">' + self.rendernote(self.note) + '</p>')
        for i in self.inputs[x:y]:
            if names is None or i.name in names:
                out.append(self.render_input(i))
        return '\n'.join(out)

    def l(self, control, **attrs):
        """Renders label for input"""
        i = self[control]

        if 'class_' in attrs:
            attrs['class'] = attrs['class_']
            del attrs['class_']

        return u'<label for="%s" %s>%s</label>' % (i.id, web.form.AttributeList(attrs), _(i.description))

    def err(self, *controls):
        """Outputs error css class for one of controls"""
        for c in controls:
            if self[c].note:
                return "error wrong"
        return ""

    def render_errors(self):
        """Renders errors block"""
        out = []
        errors = ((i.description, i.note) for i in self.inputs if i.note)
        errors = sorted(errors, key=lambda x: x[1])
        for err, fields in groupby(errors, key=lambda x: x[1]):
            out.append('<li>')
            out.append(", ".join(_(f[0]) for f in fields))
            out.append(": ")
            out.append(_(err))
            out.append('</li>')
        return ''.join(out)


class Textbox(web.form.Textbox):

    def __init__(self, name, *validators, **attrs):
        super(Textbox, self).__init__(name, *validators, **attrs)
        self.item_pre = attrs.pop("item_pre", u"")
        self.item_post = attrs.pop("item_post", u"")
        self.description = attrs.pop("description", u"")

    def render(self):
        attrs = self.attrs.copy()
        attrs['type'] = self.get_type()
        if "placeholder" in attrs:
            attrs["placeholder"] = _(attrs["placeholder"])
        if self.value is not None:
            attrs['value'] = self.value
        attrs['name'] = self.name
        res = [self.item_pre, ('<input %s>' % attrs)]
        res.append(self.item_post)
        return u"".join(res)


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

            if str(self.value) == str(value) or (isinstance(self.value, list) and value in self.value):
                select_p = ' selected="selected"'
            else:
                select_p = ''
            x += '  <option%s value="%s">%s</option>\n' % (select_p, web.net.websafe(value), web.net.websafe(_(desc)))

        x += '</select>\n'
        return x


class Checkbox(web.form.Checkbox):
    pass


class Textarea(web.form.Input):
    """Textarea input.

        >>> Textarea(name='foo', value='bar').render()
        '<textarea id="foo" name="foo">bar</textarea>'
    """

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


class TextboxList(web.form.Input):

    pass


class CheckboxList(web.form.Input):
    """CheckboxList input. """

    def __init__(self, name, args, *validators, **attrs):
        self.args = args
        self.name = name
        self.item_pre = attrs.pop("item_pre", None)
        self.item_post = attrs.pop("item_post", None)
        super(CheckboxList, self).__init__(name, *validators, **attrs)

    def render(self):
        attrs = self.attrs.copy()
        x = ''  # '<fieldset %s>\n' % attrs
        for arg in self.args:
            if self.item_pre:
                x += self.item_pre
            if isinstance(arg, (tuple, list)):
                value, desc = arg
            else:
                value, desc = arg, arg
            chk_attrs = web.form.AttributeList(name=self.name, type="checkbox", value=value)
            if isinstance(self.value, (tuple, list, set)) and value in self.value:
                chk_attrs["checked"] = "checked"
            x += ' <label class="after"><input %s/>  %s</label>\n' % (chk_attrs, web.net.websafe(desc))
            if self.item_post:
                x += self.item_post
        #x += '</fieldset>\n'
        return x


class DateInput(Textbox):

    def get_value(self):
        try:
            if type(self.value) in (datetime.datetime, datetime.date):
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


class PriceInput(Textbox):

    def get_value(self):
        try:
            return float(self.value.replace(",", ".", 1))
        except:
            return None


# TODO: translate these messages below:
notnull = web.form.Validator(u"Необходимо заполнить", bool)
validPassword = web.form.Validator(
    u"От 6 до 180 символов",
    lambda x: (x and len(x) >= 6 and len(x) <= 180)
)
passwordMatch = web.form.Validator(
    u"Пароль и подтверждение не совпадают",
    lambda form: form.password == form.password2
)
validEmail = web.form.regexp(
    r"^\s*[a-zA-Z0-9._%\-\+]+@[a-zA-Z0-9._%-]+.[a-zA-Z]{2,6}\s*$",
    u"Некорректный электронный адрес"
)
price_regexp = re.compile(r"^\s*\d{1,11}([.,]\d{1,3})?\s*$")
validPrice = web.form.Validator(
    u"Некорректная цена",
    lambda x: not x or bool(price_regexp.match(str(x)))
)


def validDate(message=u"Некорректное значение даты"):

    def valid_date(code):
        if code is None or type(code) in (datetime.datetime, datetime.date):
            return True
        try:
            date = parser.parse(code)
            return True
        except:
            return False
    return web.form.Validator(message, valid_date)
