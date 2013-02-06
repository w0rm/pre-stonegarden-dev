# coding: utf-8
import web
import json
import re
import datetime
from base import db, auth
from config import config
from models.pages import page_where
from models.blocks import (build_block_tree,
                           get_page_blocks_by_page_id,
                           render_block)

from modules.utils import dthandler
from template import template_global


@template_global
def get_recent_news(limit=5, offset=0):
    return db.select(
        "pages",
        where="`type` = 'news' AND NOT is_deleted" + page_where(),
        offset=offset,
        limit=limit,
        order="published_at DESC",
    ).list()


@template_global
def render_news_content(news, css_class="news_content"):
    news_blocks = get_page_blocks_by_page_id(news.id)
    parent_block = next(b for b in news_blocks if b.css_class == css_class)
    news_blocks = [b for b in news_blocks
                   if not b.template == "news_page_title"]
    parent_block = build_block_tree(parent_block, news_blocks)
    result = u"\n".join(unicode(render_block(b)) for b in parent_block.blocks)
    return result.replace("js-blocks", "").replace("js-block", "")


@template_global
def get_news_years():
    years = db.select(
        "pages",
        what="MAX(published_at) AS max_date, MIN(published_at) AS min_date",
        where="`type` = 'news' AND NOT is_deleted" + page_where(),
    ).list()
    if years:
        if years[0].min_date and years[0].max_date:
            year_min = years[0].min_date.year
            year_max = years[0].max_date.year
            if year_max > year_min:
                return list(range(year_min, year_max + 1))


@template_global
def get_news_next_prev_links():
    return None, None
