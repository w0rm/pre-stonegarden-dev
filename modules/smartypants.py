#!/usr/bin/python
# -*- coding: utf-8 -*-

r"""
==============
smartypants.py

slightly modified to support some Russian typography rules
==============

Description
===========

SmartyPants can perform the following transformations:

- Straight quotes ( " and ' ) into "curly" quote HTML entities
- Backticks-style quotes (\`\`like this'') into "curly" quote HTML entities
- Dashes (``--`` and ``---``) into en- and em-dash entities
- Three consecutive dots (``...`` or ``. . .``) into an ellipsis entity

This means you can write, edit, and save your posts using plain old
ASCII straight quotes, plain dashes, and plain dots, but your published
posts (and final HTML output) will appear with smart quotes, em-dashes,
and proper ellipses.

SmartyPants does not modify characters within ``<pre>``, ``<code>``, ``<kbd>``,
``<math>`` or ``<script>`` tag blocks. Typically, these tags are used to
display text where smart quotes and other "smart punctuation" would not be
appropriate, such as source code or example markup.

Backslash Escapes
=================

If you need to use literal straight quotes (or plain hyphens and
periods), SmartyPants accepts the following backslash escape sequences
to force non-smart punctuation. It does so by transforming the escape
sequence into a decimal-encoded HTML entity:

(FIXME:  table here.)

.. comment    It sucks that there's a disconnect between the visual layout and table markup when special characters are involved.
.. comment ======  =====  =========
.. comment Escape  Value  Character
.. comment ======  =====  =========
.. comment \\\\\\\\    &#92;  \\\\
.. comment \\\\"     &#34;  "
.. comment \\\\'     &#39;  '
.. comment \\\\.     &#46;  .
.. comment \\\\-     &#45;  \-
.. comment \\\\`     &#96;  \`
.. comment ======  =====  =========

This is useful, for example, when you want to use straight quotes as
foot and inch marks: 6'2" tall; a 17" iMac.

Algorithmic Shortcomings
------------------------

One situation in which quotes will get curled the wrong way is when
apostrophes are used at the start of leading contractions. For example:

``'Twas the night before Christmas.``

In the case above, SmartyPants will turn the apostrophe into an opening
single-quote, when in fact it should be a closing one. I don't think
this problem can be solved in the general case -- every word processor
I've tried gets this wrong as well. In such cases, it's best to use the
proper HTML entity for closing single-quotes (``&#8217;``) by hand.

Copyright and License
=====================

SmartyPants_ license::

    Copyright (c) 2003 John Gruber
    (http://daringfireball.net/)
    All rights reserved.

    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are
    met:

    *   Redistributions of source code must retain the above copyright
        notice, this list of conditions and the following disclaimer.

    *   Redistributions in binary form must reproduce the above copyright
        notice, this list of conditions and the following disclaimer in
        the documentation and/or other materials provided with the
        distribution.

    *   Neither the name "SmartyPants" nor the names of its contributors
        may be used to endorse or promote products derived from this
        software without specific prior written permission.

    This software is provided by the copyright holders and contributors "as
    is" and any express or implied warranties, including, but not limited
    to, the implied warranties of merchantability and fitness for a
    particular purpose are disclaimed. In no event shall the copyright
    owner or contributors be liable for any direct, indirect, incidental,
    special, exemplary, or consequential damages (including, but not
    limited to, procurement of substitute goods or services; loss of use,
    data, or profits; or business interruption) however caused and on any
    theory of liability, whether in contract, strict liability, or tort
    (including negligence or otherwise) arising in any way out of the use
    of this software, even if advised of the possibility of such damage.

smartypants.py license::

    smartypants.py is a derivative work of SmartyPants.

    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are
    met:

    *   Redistributions of source code must retain the above copyright
        notice, this list of conditions and the following disclaimer.

    *   Redistributions in binary form must reproduce the above copyright
        notice, this list of conditions and the following disclaimer in
        the documentation and/or other materials provided with the
        distribution.

    This software is provided by the copyright holders and contributors "as
    is" and any express or implied warranties, including, but not limited
    to, the implied warranties of merchantability and fitness for a
    particular purpose are disclaimed. In no event shall the copyright
    owner or contributors be liable for any direct, indirect, incidental,
    special, exemplary, or consequential damages (including, but not
    limited to, procurement of substitute goods or services; loss of use,
    data, or profits; or business interruption) however caused and on any
    theory of liability, whether in contract, strict liability, or tort
    (including negligence or otherwise) arising in any way out of the use
    of this software, even if advised of the possibility of such damage.

.. _John Gruber: http://daringfireball.net/
.. _Chad Miller: http://web.chad.org/

.. _Pyblosxom: http://roughingit.subtlehints.net/pyblosxom
.. _SmartyPants: http://daringfireball.net/projects/smartypants/
.. _Movable Type: http://www.movabletype.org/

"""

import re
import htmlentitydefs
import unicodedata


def entity(name):
    return unichr(htmlentitydefs.name2codepoint[name])

sym = {
    "ru": {
        'lduote': entity('laquo'),
        'rduote': entity('raquo'),
        'lquote': entity('bdquo'),
        'rquote': entity('ldquo'),
    },
    "en": {
        'lduote': entity('ldquo'),
        'rduote': entity('rdquo'),
        'lquote': entity('lsquo'),
        'rquote': entity('rsquo'),
    },
    'nbsp': entity('nbsp'),
    'mdash': entity('mdash'),
    'ndash': entity('ndash'),
    'minus': entity('minus'),
    'hellip': entity('hellip'),
    'copy': entity('copy'),
    'trade': entity('trade'),
    'apos': entity('rsquo'),
    'reg': entity('reg'),
    'multiply': entity('times'),
    '1/2': entity('frac12'),
    '1/4': entity('frac14'),
    '3/4': entity('frac34'),
    'plusmn': entity('plusmn'),
    'rarr': entity('rarr'),
    'larr': entity('larr'),
    'rsquo': entity('rsquo'),
    'rsaquo': entity('rsaquo'),
    'lsaquo': entity('lsaquo'),
}

tags_to_skip_regex = re.compile(r"<(/)?(pre|code|kbd|script|math)[^>]*>", re.I)

prepos = u'а|в|во|и|к|о|с|у|о|со|об|от|то|на|не|ни|но|из|за|уж|на|по|да|до|их|ко|я'
postpos = u'ж|бы|б|же|ли|ль'
hypopos = u'х|й'
metrics = u'мм|см|м|км|кг|г|б|кб|мб|гб|dpi|px'
shortages = u'гн|гжа|гр|г|тов|пос|c|ул|д|наб|пр|пер|м|Гн|Гжа|Гр|Г|Тов|Пос|С|Ул|Д|Пер|М|Dj|DJ|Mc|MC|Vj|VJ'
rur = u'руб|rub'

rur_regex = re.compile(u'(\d+)[\s%s]+(%s)\.' % (sym['nbsp'], rur), re.I)

prepos_regex = re.compile(u'(?<=\s|\W)(%s)(\s+)' % prepos, re.I|re.U)
prepos_regex2 = re.compile(u'(?<=^)(%s)(\s+)' % prepos, re.I|re.U)
mdash_regex = re.compile(u'(\s+)(%s)(?=\s)' % sym['mdash'], re.I|re.U)
postpos_regex = re.compile(u'(?<=\S)\s+(%s)(?!\w)' % postpos, re.U)

metrics_regex = re.compile(u'(\d+)[\s*%s](%s)\.?(?=[\s%s]|\.$)' % (sym['nbsp'], metrics, sym['nbsp']))
metrics_regex2 = re.compile(u'(?<!\d)(\d{1,2})[\s*%s](?=\w)' % sym['nbsp'], re.U)

hypopos_regex = re.compile(u'(?<!\d)(\d+)-(%s)(?=\s|\W|$)' % hypopos, re.U)

initials_regex = re.compile(u'([А-ЯA-Z]\.)\s?([А-ЯA-Z]\.)\s?([А-Яа-яA-Za-z]+)', re.S)
shortages_regex = re.compile(u'(\s|\W|^)(%s)(\.?)\s+(?=[А-ЯA-Z\d])' % shortages, re.U)
apostrophe_regex = re.compile(u'(?<=\w)(%s)(?=\w)' % sym["ru"]['rquote'], re.U)


def rusTypography(st):
    st = initials_regex.sub(r'<span class="nobr">\1&thinsp;\2 \3</span>', st)
    st = shortages_regex.sub(r'\1\2\3' + sym['nbsp'], st)
    st = metrics_regex.sub(r'\1%s\2' % sym['nbsp'], st)
    st = metrics_regex2.sub(r'\1' + sym['nbsp'], st)
    st = hypopos_regex.sub(r'<span class="nobr">\1-\2</span>', st)
    st = rur_regex.sub(r'\1%s<em class="rur"><em>\2.</em></em>' % sym['nbsp'], st)
    st = prepos_regex.sub(r'\1'+sym['nbsp'], st)
    st = prepos_regex2.sub(r'\1'+sym['nbsp'], st)
    st = postpos_regex.sub(sym['nbsp'] + r'\1', st)
    st = mdash_regex.sub(sym['nbsp'] + sym['mdash'], st)
    st = apostrophe_regex.sub(sym['apos'], st)
    return st


def smartyPants(text, lang="ru"):

    if text is None:
        return None

    skipped_tag_stack = []
    tokens = _tokenize(text)
    result = []
    in_pre = False
    prev_token_last_char = ""
    # This is a cheat, used to get some context
    # for one-character tokens that consist of
    # just a quote char. What we do is remember
    # the last character of the previous text
    # token, to use as context to curl single-
    # character quote tokens correctly.

    for cur_token in tokens:
        if cur_token[0] == "tag":
            # Don't mess with quotes inside some tags.  This does not handle self <closing/> tags!
            result.append(cur_token[1])
            skip_match = tags_to_skip_regex.match(cur_token[1])
            if skip_match is not None:
                if not skip_match.group(1):
                    skipped_tag_stack.append(skip_match.group(2).lower())
                    in_pre = True
                else:
                    if len(skipped_tag_stack) > 0:
                        if skip_match.group(2).lower() == skipped_tag_stack[-1]:
                            skipped_tag_stack.pop()
                        else:
                            pass
                            # This close doesn't match the open.  This isn't XHTML.  We should barf here.
                    if len(skipped_tag_stack) == 0:
                        in_pre = False
        else:
            t = cur_token[1]
            last_char = t[-1:] # Remember last char of this token before processing.
            if not in_pre:
                oldstr = t
                t = processEscapes(t)

                t = re.sub('&quot;', '"', t)
                t = educateDashes(t)
                t = educateEllipses(t)

                if t == "'":
                    # Special case: single-character ' token
                    if re.match("\S", prev_token_last_char):
                        t = sym[lang]['rquote']
                    else:
                        t = sym[lang]['lquote']
                elif t == '"':
                    # Special case: single-character " token
                    if re.match("\S", prev_token_last_char):
                        t = sym[lang]['rduote']
                    else:
                        t = sym[lang]['lduote']
                else:
                    # Normal case:
                    t = educateQuotes(t, lang)
                    if lang == "ru":
                        t = rusTypography(t)

            prev_token_last_char = last_char
            result.append(t)

    return "".join(result)


def educateQuotes(str, lang):
    """
    Parameter:  String.

    Returns:    The string, with "educated" curly quote HTML entities.

    Example input:  "Isn't this fun?"
    Example output: &#8220;Isn&#8217;t this fun?&#8221;
    """

    oldstr = str
    punct_class = r"""[!"#\$\%'()*+,-.\/:;<=>?\@\[\\\]\^_`{|}~]"""

    # Special case if the very first character is a quote
    # followed by punctuation at a non-word-break. Close the quotes by brute force:
    str = re.sub(r"""^'(?=%s\\B)""" % (punct_class, ), sym[lang]['rquote'], str)
    str = re.sub(r"""^"(?=%s\\B)""" % (punct_class, ), sym[lang]['rduote'], str)

    # Special case for double sets of quotes, e.g.:
    #   <p>He said, "'Quoted' words in a larger quote."</p>
    str = re.sub(r""""'(?=\w)""", sym[lang]['lduote']+sym[lang]['lquote'], str)
    str = re.sub(r"""'"(?=\w)""", sym[lang]['lquote']+sym[lang]['lduote'], str)

    # Special case for decade abbreviations (the '80s):
    str = re.sub(r"""\b'(?=\d{2}s)""", r"""&#8217;""", str)

    close_class = r"""[^\ \t\r\n\[\{\(\-]"""
    dec_dashes = r"""&#8211;|&#8212;"""

    # Get most opening single quotes:
    opening_single_quotes_regex = re.compile(r"""
            (
                \s          |   # a whitespace char, or
                &nbsp;      |   # a non-breaking space entity, or
                --          |   # dashes, or
                &[mn]dash;  |   # named dash entities
                %s          |   # or decimal entities
                &\#x201[34];    # or hex
            )
            '                 # the quote
            (?=\w)            # followed by a word character
            """ % (dec_dashes, ), re.VERBOSE|re.U)
    str = opening_single_quotes_regex.sub(r"""\1"""+sym[lang]['lquote'], str)

    closing_single_quotes_regex = re.compile(r"""
            (%s)
            '
            (?!\s | s\b | \d)
            """ % (close_class, ), re.VERBOSE|re.U)
    str = closing_single_quotes_regex.sub(r"""\1"""+sym[lang]['rquote'], str)

    closing_single_quotes_regex = re.compile(r"""
            (%s)
            '
            (\s | s\b)
            """ % (close_class, ), re.VERBOSE|re.U)
    str = closing_single_quotes_regex.sub(r"""\1""" + sym[lang]['rquote'] + r"""\2""", str)

    # Any remaining single quotes should be opening ones:
    str = re.sub(r"""'""", sym[lang]['lquote'], str)

    # Get most opening double quotes:
    opening_double_quotes_regex = re.compile(r"""
            (
                \s          |   # a whitespace char, or
                &nbsp;      |   # a non-breaking space entity, or
                --          |   # dashes, or
                &[mn]dash;  |   # named dash entities
                %s          |   # or decimal entities
                &\#x201[34];    # or hex
            )
            "                 # the quote
            (?=\w)            # followed by a word character
            """ % (dec_dashes, ), re.VERBOSE|re.U)
    str = opening_double_quotes_regex.sub(r"""\1"""+sym[lang]['lduote'], str)

    # Double closing quotes:
    closing_double_quotes_regex = re.compile(r"""
            #(%s)?   # character that indicates the quote should be closing
            "
            (?=\s)
            """ % (close_class, ), re.VERBOSE|re.U)
    str = closing_double_quotes_regex.sub(sym[lang]['rduote'], str)

    closing_double_quotes_regex = re.compile(r"""
            (%s)   # character that indicates the quote should be closing
            "
            """ % (close_class, ), re.VERBOSE|re.U)
    str = closing_double_quotes_regex.sub(r"""\1"""+sym[lang]['rduote'], str)

    # Any remaining quotes should be opening ones.
    str = re.sub(r'"', sym[lang]['lduote'], str)

    return str


def educateDashes(str):
    """
    Parameter:  String.

    Returns:    The string, with each instance of "--" translated to
                an em-dash HTML entity.
    """

    str = re.sub(r"""---""", sym["ndash"], str) # en  (yes, backwards)
    str = re.sub(r"""--""", sym["mdash"], str) # em (yes, backwards)
    return str


def educateEllipses(str):
    """
    Parameter:  String.
    Returns:    The string, with each instance of "..." translated to
                an ellipsis HTML entity.

    Example input:  Huh...?
    Example output: Huh&#8230;?
    """

    str = re.sub(r"""\.\.\.""", sym["hellip"], str)
    str = re.sub(r"""\. \. \.""", sym["hellip"], str)
    return str


def processEscapes(str):
    r"""
    Parameter:  String.
    Returns:    The string, with after processing the following backslash
                escape sequences. This is useful if you want to force a "dumb"
                quote or other character to appear.

                Escape  Value
                ------  -----
                \\      &#92;
                \"      &#34;
                \'      &#39;
                \.      &#46;
                \-      &#45;
                \`      &#96;
    """
    str = re.sub(r"""\\\\""", r"""&#92;""", str)
    str = re.sub(r'''\\"''', r"""&#34;""", str)
    str = re.sub(r"""\\'""", r"""&#39;""", str)
    str = re.sub(r"""\\\.""", r"""&#46;""", str)
    str = re.sub(r"""\\-""", r"""&#45;""", str)
    str = re.sub(r"""\\`""", r"""&#96;""", str)

    return str


def _tokenize(str):
    """
    Parameter:  String containing HTML markup.
    Returns:    Reference to an array of the tokens comprising the input
                string. Each token is either a tag (possibly with nested,
                tags contained therein, such as <a href="<MTFoo>">, or a
                run of text between tags. Each element of the array is a
                two-element array; the first is either 'tag' or 'text';
                the second is the actual value.

    Based on the _tokenize() subroutine from Brad Choate's MTRegex plugin.
        <http://www.bradchoate.com/past/mtregex.php>
    """

    pos = 0
    length = len(str)
    tokens = []

    depth = 6
    nested_tags = "|".join(['(?:<(?:[^<>]', ] * depth) + (')*>)' * depth)
    #match = r"""(?: <! ( -- .*? -- \s* )+ > ) |  # comments
    #       (?: <\? .*? \?> ) |  # directives
    #       %s  # nested tags       """ % (nested_tags,)
    tag_soup = re.compile(r"""([^<]*)(<[^>]*>)""")

    token_match = tag_soup.search(str)

    previous_end = 0
    while token_match is not None:
        if token_match.group(1):
            tokens.append(['text', token_match.group(1)])

        tokens.append(['tag', token_match.group(2)])

        previous_end = token_match.end()
        token_match = tag_soup.search(str, token_match.end())

    if previous_end < len(str):
        tokens.append(['text', str[previous_end:]])

    return tokens
