# coding: utf-8

import web
import os
import json
import datetime
from time import sleep
from config import config
from modules.translation import N_, _
from base import db, auth, flash, mailer, applog
from template import render, render_partial, render_email, link_to
from modules.form import *

new_user_text = N_("New user in system: %s.")
edit_user_text = N_("User detailes changed: %s.")
undo_user_text = N_("User was deleted. <a href=\"%s\">Undo delete?</a>")
deleted_user_text = N_("User deleted: %s.")
undelete_user_text = N_("User was restored.")
undeleted_user_text = N_("User restored: %s.")
cannot_delete_self_text = N_("Self delete forbidden.")


userForm = Form(
    EmailInput("email", validEmail, description=N_("Email"),
               size=30, maxlength=64),
    Textbox("title", notnull, description=N_("Name"), size=30,
            maxlength=255),
    Dropdown("role", [(u, config.labels[u]) for u in config.user_roles],
             description=N_("Role")),
    Checkbox("is_active", description=N_("Is active"), value="ok"),
)


class Users:

    @auth.restrict("admin")
    def GET(self):
        users = db.select("users", where="NOT is_deleted", order="id DESC")
        user_form = userForm()
        return render.auth.list(users, user_form)


class NewUser:

    @auth.restrict("admin")
    def POST(self):
        user_form = userForm(web.input())
        if user_form.valid:
            user = user_form.d
            email = user.pop("email")
            password = tempPassword()
            user.update(password=password)
            user = auth.get_user(user_id=auth.create_user(email, **user))
            mailer.send(
                user.email,
                render_email.register(user, password),
                send_now=True,
                is_secure=True,
            )
            applog.info(new_user_text % user.title, "users", user.id)
        raise web.seeother(web.ctx.env.get("HTTP_REFERER", "/a/users"))


class EditUser:

    @auth.restrict("admin")
    def GET(self, user_id):
        users = db.select("users", where="NOT is_deleted", order="id DESC")
        user = db.select("users", locals(), where="id=$user_id")[0]
        user_form = userForm()
        user_form.fill(user)
        return render.auth.form(users, user_form, user)

    @auth.restrict("admin")
    def POST(self, user_id):
        user_form = userForm(web.input())
        if user_form.valid:
            user = user_form.d
            if not user.is_active:
                auth.delete_session(user_id)
            auth.updateUser(user_id, **user)
            applog.info(edit_user_text % user.title, "users", user_id)
            raise web.seeother("/a/users")
        else:
            raise web.seeother(web.ctx.env.get("HTTP_REFERER", "/a/users"))


class DeleteUser:

    @auth.restrict("admin")
    def GET(self, user_id, method):
        user = auth.get_user(user_id=user_id, is_deleted=True)
        if user.id != auth.get_user().id:
            auth.updateUser(user.id, is_deleted=method == "delete")
            if method == "delete":
                flash.set(_(undo_user_text) %
                          link_to("users", user, "undelete"))
                applog.info(_(deleted_user_text) %
                            user.title, "users", user.id, "warn")
            else:
                flash.set(_(undelete_user_text))
                applog.info(undeleted_user_text %
                            user.title, "users", user.id, "warn")
            auth.delete_session(user.id)
        else:
            flash.set(_(cannot_delete_self_text), "error")
        raise web.seeother("/a/users")
