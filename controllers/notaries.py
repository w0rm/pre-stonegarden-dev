# coding: utf-8

import web
from modules.translation import N_, _
from template import render, link_to
from modules.restful_controller import RESTfulController
from modules.form import *
from models.notaries import *


class Notaries(RESTfulController):

    form = ApiForm(
        web.form.Input("longitude", notnull),
        web.form.Input("latitude", notnull),
        web.form.Input("title", notnull),
        web.form.Input("address", notnull),
        web.form.Input("phone"),
        web.form.Input("region_id"),
        web.form.Input("notary_image_id"),
        web.form.Input("office_image_id"),
        web.form.Input("description"),
        web.form.Input("legacy_letters"),
        web.form.Input("late_days"),
    )

    @auth.restrict("admin", "editor")
    def list(self):
        region_id = web.input(region_id=None).region_id
        notaries = get_notaries(region_id)
        web.header("Content-Type", "application/json")
        return notaries_to_json(notaries)

    @auth.restrict("admin", "editor")
    def get(self, notary_id):
        notary = get_notary_by_id(notary_id)
        web.header("Content-Type", "application/json")
        return notary_to_json(notary)

    @auth.restrict("admin", "editor")
    def create(self):
        form = self.form()
        if form.validates():
            notary = create_notary(form.d)
            raise web.seeother(link_to("notaries", notary))
        raise form.validation_error()

    @auth.restrict("admin", "editor")
    def update(self, notary_id):
        form = self.form()
        if form.validates():
            notary = update_notary_by_id(notary_id, form.d)
            raise web.seeother(link_to("notaries", notary))
        raise form.validation_error()

    @auth.restrict("admin", "editor")
    def delete(self, notary_id):
        delete_notary_by_id(notary_id)
        web.header("Content-Type", "application/json")
        return '{"status": 1}'
