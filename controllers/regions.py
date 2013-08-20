# coding: utf-8

import web
import datetime
from base import db, auth, flash
from modules.translation import N_, _
from template import render, link_to
from config import config
from modules.form import *
from models.regions import *
from modules.restful_controller import RESTfulController


class Regions(RESTfulController):

    form = ApiForm(
        web.form.Input("longitude"),
        web.form.Input("latitude"),
        web.form.Input("title"),
        web.form.Input("address", notnull),
    )

    @auth.restrict("admin", "editor")
    def get(self, region_id):
        region = get_region_by_id(region_id)
        web.header("Content-Type", "application/json")
        return region_to_json(region)

    @auth.restrict("admin", "editor")
    def create(self):
        form = self.form()
        if form.validates():
            region = create_region(form.d)
            raise web.seeother(link_to("regions", region))
        raise form.validation_error()

    @auth.restrict("admin", "editor")
    def update(self, region_id):
        form = self.form()
        if form.validates():
            region = update_region_by_id(region_id, form.d)
            raise web.seeother(link_to("regions", region))
        raise form.validation_error()

    @auth.restrict("admin", "editor")
    def delete(self, region_id):
        delete_region_by_id(region_id)
        web.header("Content-Type", "application/json")
        return '{"status": 1}'
