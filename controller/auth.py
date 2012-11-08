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
from modules.dbauth import AuthError, make_token, check_token, temp_password
from modules.form import *

sent_text = N_("We've sent you the link to reset your password. Please check your email.")
reset_text = N_("It seems that the link is outdated or incorect. You may create another one <a href=\"/password_reset\">here</a>.")
changed_text = N_("Password was changed. You've been automatically logged in.")
new_user_text = N_("New user in system: %s.")
edit_user_text = N_("User detailes changed: %s.")
undo_user_text = N_("User was deleted. <a href=\"%s\">Undo delete?</a>")
deleted_user_text = N_("User deleted: %s.")
undelete_user_text = N_("User was  restored.")
undeleted_user_text = N_("User restored: %s.")
cannot_delete_self_text = N_("Self delete forbidden.")
email_doesnt_exist_text = N_("User with this email doesn't exist.")
login_incorrect_text = N_("Incorrect login credentials.")
account_blocked_text = N_("Your account has been blocked.")

loginForm = Form(
    EmailInput("email", validEmail, description=N_("Email"), maxlength=254),
    Password("password", validPassword, description=N_("Password"), maxlength=254),
    validators=[auth.valid_login(login_incorrect_text), auth.is_active(account_blocked_text)],
)
passwordResetForm = Form(
    EmailInput("email", validEmail, description=N_("Email"), maxlength=254),
)
passwordChangeForm = Form(
    Password("password", validPassword, description=N_("New password"), maxlength=180),
    Password("password2", notnull, description=N_("Repeat"), maxlength=180),
    validators=[passwordMatch],
)
userForm = Form(
    EmailInput("email", validEmail, description=N_("Email"), size=30, maxlength=64),
    Textbox("title", notnull, description=N_("Name"), size=30, maxlength=255),
    Dropdown("role", [(u, config.labels[u]) for u in config.user_roles], description=N_("Role")),
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
                flash.set(_(undo_user_text) % link_to("users", user, "undelete"))
                applog.info(_(deleted_user_text) % user.title, "users", user.id, "warn")
            else:
                flash.set(_(undelete_user_text))
                applog.info(undeleted_user_text % user.title, "users", user.id, "warn")
            auth.delete_session(user.id)
        else:
            flash.set(_(cannot_delete_self_text), "error")
        raise web.seeother("/a/users")


class Login:

    def GET(self):
        if auth.get_user():
            raise web.found("/")
        if web.ctx.env.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest':
            return render_partial.auth.login(loginForm())
        else:
            return render.auth.login(loginForm())

    def POST(self):
        # artificial delay (to slow down brute force attacks)
        sleep(0.5)
        form = loginForm()
        if not form.validates():
            return render.auth.login(form)
        next = web.ctx.session.get("next", web.ctx.env.get("HTTP_REFERER", "/"))
        try:
            del web.ctx.session["next"]
        except KeyError:
            pass
        raise web.seeother(next)


class Logout:

    @auth.restrict("admin", "editor", "user")
    def GET(self):
        auth.logout()
        raise web.seeother("/login")

    POST = GET


class ResetToken:

    def GET(self):
        email = web.input().get("email")
        form = passwordResetForm()
        if email:
            form.email.value = email
        return render.auth.reset_token(form)

    def POST(self):
        form = passwordResetForm()
        if form.validates():
            try:
                user = auth.get_user(email=form.d.email, password=True)
                token_url = "%s%s/%s$%s" % (web.ctx.home, "/password_reset", user.id, makeToken(user))
                mailer.send(
                    user.email,
                    render_email.password_reset(user, token_url),
                    send_now=True,
                    is_secure=True,
                )
                flash.set(_(sent_text))
                raise web.seeother("/")
            except IndexError:
                form.note = _(email_doesnt_exist_text)
        return render.auth.reset_token(form)


class ResetChange:

    def GET(self, uid, token):
        # artificial delay (to slow down brute force attacks)
        sleep(0.5)
        try:
            user = auth.get_user(user_id=uid, password=True)
            if not user or not checkToken(user, token, auth.config.reset_expire_after):
                raise AuthError
            return render.auth.reset_change(passwordChangeForm)
        except AuthError:
            flash.set(_(reset_text))
            raise web.seeother("/")

    def POST(self, uid, token):
        # artificial delay (to slow down brute force attacks)
        sleep(0.5)
        form = passwordChangeForm(web.input())
        if form.valid:
            try:
                user = auth.get_user(user_id=uid, password=True)
                if not user or not checkToken(user, token, auth.config.reset_expire_after):
                    raise AuthError
                auth.setPassword(user.email, form.d.password)
                auth.login(user)
                flash.set(_(changed_text))
            except AuthError:
                flash.set(_(reset_text))
            raise web.seeother("/")
        else:
            return render.auth.reset_change(form)
