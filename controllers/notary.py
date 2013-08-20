# coding: utf-8

import web
from template import render
from models.regions import get_regions, regions_to_json
from base import auth


class Notary:

    @auth.restrict("admin", "editor", "user")
    def GET(self):
        regions = get_regions()
        json_data = web.storage(
            regions=regions_to_json(regions),
        )
        return render.notary.notary(json_data)
