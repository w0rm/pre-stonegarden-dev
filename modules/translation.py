"""
Caches translations and provides _, n_, and N_
"""
import web
import gettext
from config import config

all_translations = dict()


def load_translation(lang):
    """Load translation or create it and then loads."""
    if lang in all_translations:
        translation = all_translations[lang]
    elif lang is None:
        translation = gettext.NullTranslations()
    else:
        try:
            translation = gettext.translation(
                'messages',
                config.locale_dir,
                languages=[lang]
            )
            all_translations[lang] = translation
        except IOError:
            translation = gettext.NullTranslations()
    return translation


def _(string):
    """Translate to the language of the application."""
    translation = load_translation(web.ctx.get("lang", config.default_locale))
    return translation.ugettext(string)


def n_(singular, plural, n):
    """Translate to the language of the
    application with regard to plural form.
    """
    translation = load_translation(web.ctx.get("lang", config.default_locale))
    return translation.ungettext(singular, plural, n)


def N_(string):
    """Do nothing, just return the string."""
    return string
