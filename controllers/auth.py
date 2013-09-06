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

sent_text = N_("We've sent you the link to reset your password. "
               "Please check your email.")
reset_text = N_("It seems that the link is outdated or incorect. "
                "You may create another one "
                "<a href='/password_reset'>here</a>.")
changed_text = N_("Password was changed. You've been automatically logged in.")
email_doesnt_exist_text = N_("User with this email doesn't exist.")
login_incorrect_text = N_("Incorrect login credentials.")
account_blocked_text = N_("Your account has been blocked.")

loginForm = Form(
    EmailInput("email", validEmail, description=N_("Email"),
               maxlength=254),
    Password("password", validPassword, description=N_("Password"),
             maxlength=254),
    validators=[auth.valid_login(login_incorrect_text),
                auth.is_active(account_blocked_text)],
)
passwordResetForm = Form(
    EmailInput("email", validEmail, description=N_("Email"),
               maxlength=254),
)
passwordChangeForm = Form(
    Password("password", validPassword, description=N_("New password"),
             maxlength=180),
    Password("password2", notnull, description=N_("Repeat"),
             maxlength=180),
    validators=[passwordMatch],
)


class Login:

    def GET(self):
        if auth.get_user():
            raise web.found('/?edit')
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
        next = web.ctx.session.get("next", web.ctx.env.get("HTTP_REFERER",
                                                           '/?edit'))
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
                user = auth.get_user(email=form.d.email, with_password=True)
                token_url = "%s%s/%s$%s" % (web.ctx.home, "/password_reset",
                                            user.id, make_token(user))
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
            user = auth.get_user(user_id=uid, with_password=True)
            if not user or not check_token(user, token,
                                           auth.config.reset_expire_after):
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
                user = auth.get_user(user_id=uid, with_password=True)
                if not user or not check_token(user, token,
                                               auth.config.reset_expire_after):
                    raise AuthError
                auth.set_password(user.email, form.d.password)
                auth.login(user)
                flash.set(_(changed_text))
            except AuthError:
                flash.set(_(reset_text))
            raise web.seeother("/")
        else:
            return render.auth.reset_change(form)
