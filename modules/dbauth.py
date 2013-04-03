# coding: utf-8
"""
Simple authentication module for web.py
Needs a user table with at least the following columns:
CREATE TABLE users (
    id INTEGER NOT NULL AUTO_INCREMENT,
    title VARCHAR(255),
    email VARCHAR(64) NOT NULL,
    password VARCHAR(180) NOT NULL,
    role VARCHAR(10) NOT NULL,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    is_active BOOL DEFAULT '0',
    is_deleted BOOL DEFAULT '0',
    PRIMARY KEY (id),
    UNIQUE (email),
    CHECK (is_active IN (0, 1)),
    CHECK (is_deleted IN (0, 1))
)
"""
import json
import web
from web.session import SessionExpired
from os import urandom
from time import time
from translation import N_, _

try:
    import hashlib
    sha = hashlib.sha1
except ImportError:
    import sha
    sha = sha.new


DEFAULT_SETTINGS = web.storage({
    'reset_expire_after': 24 * 3,  # Hours
    'hash': 'sha512',
    'hash_depth': 12,
    'password_minlen': 6,  # Min length of passwords
})

UNUSABLE_PASSWORD = '!'  # This will never be a valid hash

access_forbidden_text = N_(u"You don’t have permission to access this page.")
user_exists_text = N_("User with this email already exists.")


class AuthError(Exception):
    pass


class HashError(Exception):
    pass


class DBUserStore(web.session.DBStore):
    """Store for saving a session in database
    Needs a table with the following columns:
        session_id CHAR(128) UNIQUE NOT NULL,
        user_id INTEGER,
        atime DATETIME NOT NULL default current_timestamp,
        data TEXT
    """

    def __setitem__(self, key, value):
        data = dict(data=self.encode(value))
        if "user" in value:
            data["user_id"] = value["user"].get("id")
        if key in self:
            self.db.update(self.table, where="session_id=$key",
                           vars=locals(), **data)
        else:
            self.db.insert(self.table, False, session_id=key, **data)


class DBAuth(object):
    """
    Database authentication class.
    """

    def __init__(self, db, flash, **settings):
        self._db = db
        self._flash = flash
        self.config = web.storage(web.dictadd(DEFAULT_SETTINGS, settings))
        hashtype = self.config.get('hash')
        try:
            if hashtype == 'sha512':
                self.hash = hash_sha512
            elif hashtype == 'sha1':
                self.hash = hash_sha1
            elif hashtype == 'bcrypt':
                self.hash = hash_bcrypt
            else:
                raise HashError("Hash type must be sha512, sha1 or bcrypt")
        except ImportError:
            raise HashError('Hash type %s not available' % (hash,))

    def restrict(self, *roles):
        """
        @restrict(roles)

        Decorator for limiting the access to pages.
        'roles' can be either a single permission (string) or a sequence
        of them.
        """

        def decorator(func):
            def proxyfunc(iself, *args, **kw):
                try:
                    user = web.ctx.session.user
                    if not self.has_role(*roles):
                        raise AuthError
                except (AttributeError, AuthError, SessionExpired):
                    if (not web.ctx.env.get('HTTP_X_REQUESTED_WITH') ==
                            'XMLHttpRequest'):
                        web.ctx.session.next = web.ctx.fullpath
                    raise self._flash.redirect(_(access_forbidden_text),
                                               "/login")
                return func(iself, *args, **kw)
            return proxyfunc
        return decorator

    def check_password(self, password, stored_passw):
        """
        Returns a boolean of whether the password was correct.
        """
        hashtype, n, salt = split_password(stored_passw)
        try:
            if hashtype == 'sha512':
                hashed = hash_sha512(password, salt, n)
            elif hashtype == 'sha1':
                hashed = hash_sha1(password, salt, n)
            elif hashtype == 'bcrypt':
                hashed = hash_bcrypt(password, stored_passw, n)
        except ImportError:
            raise HashError('Hash type %s not available' % (hashtype,))
        return stored_passw == hashed

    def authenticate(self, email, password):
        """
        Validates the user's credentials. If are valid, returns
        a user object (minus the password hash).
        """
        password = password.strip()
        user = self.get_user(email=email, with_password=True)
        if not user or not self.check_password(password, user.password):
            return None

        # Auto-update the password hash to the current algorithm
        hashtype, n, salt = split_password(user.password)
        if (hashtype != self.config.hash) or (n != self.config.hash_depth):
            self.set_password(email, password)

        del user['password']
        return user

    def authernticate_and_login(self, form):
        user = self.authenticate(form.email, form.password)
        if user:
            self.login(user)
            return True
        else:
            return False

    def valid_login(self, message):
        """
        web.form validator for login check
        """
        auth = self
        return web.form.Validator(
            message,
            lambda form: auth.authernticate_and_login(form))

    def is_active(self, message):
        auth = self
        return web.form.Validator(
            message,
            lambda form: auth.get_user() and auth.get_user().is_active)

    def login(self, user):
        """
        Set the user as logged in.
        """
        self._db.update(
            'users',
            last_login_at=web.SQLLiteral("CURRENT_TIMESTAMP"),
            where='id = $uid',
            vars={'uid': user.id},
        )
        try:
            del user['password']
        except KeyError:
            pass
        web.ctx.session.user = user

    def logout(self):
        """
        Flush the authenticated user session.
        """
        web.ctx.session.kill()

    def user_exists(self, email):
        """
        Return True if a user with that email already exists.
        """
        return bool(self.get_user(email=email, select_deleted=True))

    def create_user(self, email, password=None, **data):
        """
        Create and return a new user.
        If password is None, it will mark the user as having no password
        (check_password() for this user will never return True).
        """
        if self.user_exists(email):
            raise AuthError(_(user_exists_text))
        if not password:
            hashed = UNUSABLE_PASSWORD
        else:
            hashed = self.hash(password)
        user_id = self._db.insert(
            'users',
            email=email,
            password=hashed,
            created_at=web.SQLLiteral("CURRENT_TIMESTAMP"),
            **data)
        user = self.get_user(user_id)
        return user

    def set_password(self, email, password=None):
        """
        Sets the password of the user with email 'email'
        to the given raw string, taking care of the password hashing.
        """
        if not password:
            hashed = UNUSABLE_PASSWORD
        else:
            hashed = self.hash(password)
        self._db.update(
            'users',
            password=hashed,
            where='email = $email',
            vars={'email': email},
        )

    def update_user(self, user_id, **data):
        """
        Update the user's data taking care of the password hashing if
        one is provided.
        """
        if 'password' in data:
            self.set_password(email, data['password'])
            del data['password']
        auth_user = self.get_user()
        self._db.update(
            'users',
            where='id = $user_id',
            vars={'user_id': user_id},
            **data)
        if not data.get('is_active', True) or data.get("is_deleted"):
            self.delete_user_session(user_id)
        if auth_user and auth_user.id == user_id:
            web.ctx.session.user = self.get_user(user_id)

    def delete_user_session(self, user_id):
        self._db.delete("sessions", where="user_id = $user_id", vars=locals())

    def get_user(self, user_id=None, email=None, with_password=False,
                 select_deleted=False):
        """
        Selects user by id or email and returns a user object.
        If id and email are None returns the currently
        authenticated user object or None if there isn't one.
        """
        deleted = " AND NOT is_deleted" if not select_deleted else ""
        try:
            if email is not None:
                user = self._db.select(
                    'users',
                    where='email = $email' + deleted,
                    vars={'email': email.strip().lower()},
                )[0]
                print user.id
            elif user_id is not None:
                user = self._db.select(
                    'users',
                    where='id = $user_id' + deleted,
                    vars={'user_id': user_id},
                )[0]
            else:
                if (web.ctx.session.user and web.ctx.session.user.is_deleted or
                        not web.ctx.session.user.is_active):
                    web.ctx.session.user = None
                return web.ctx.session.user
        except (IndexError, AttributeError, SessionExpired):
            return None
        if not with_password:
            del user["password"]
        return user

    def pass_test(self, test, user=None):
        """
        Return True if the [authenticated] user pass the test.
        'test' must be a function that takes a user object and returns
        True or False.
        """
        user = user or self.get_user()
        if not user:
            return False
        return test(user)

    def has_role(self, *roles):
        """
        Return True if the [authenticated] user has one of the specified roles.
        'role' can be either a single role (string) or a sequence
        of them.
        """
        user = self.get_user()
        if not user:
            return False
        return user.role in roles


def hash_sha512(password, salt='', n=12):
    from hashlib import sha512
    salt = salt or sha(urandom(40)).hexdigest()
    hashed = sha512(salt + password).hexdigest()
    for i in xrange(n):
        hashed = sha512(hashed + salt).hexdigest()
    return '$sha512$%i$%s$%s' % (n, salt, hashed)


def hash_sha1(password, salt='', n=12):
    salt = salt or sha(urandom(32)).hexdigest()
    hashed = sha(salt + password).hexdigest()
    for i in xrange(n):
        hashed = sha(hashed + salt).hexdigest()
    return '$sha1$%i$%s$%s' % (n, salt, hashed)


def hash_bcrypt(password, salt='', n=12):
    import bcrypt
    salt.replace('$bcrypt$', '$2a$', 1)
    salt = salt or bcrypt.gensalt(n)
    hashed = bcrypt.hashpw(password, salt)
    return hashed.replace('$2a$', '$bcrypt$', 1)


def split_password(password):
    """
    Split the password hash into it's components.
    Returns a tuple of the hashtype, number of repetitions and salt.
    """
    sp = password[1:].split('$')
    hashtype = sp[0]
    n = int(sp[1])
    salt = sp[2]
    return hashtype, n, salt


def random_password():
    """
    Generate a random secure password.
    """
    return sha(urandom(40)).hexdigest()


def temp_password(length=10, allowed_chars='abcdefghjkpqrstuvwxyz3456789'):
    """
    Generates a temporary password with the given length and given
    allowed_chars.
    """
    from random import choice
    return ''.join([choice(allowed_chars) for i in range(length)])


"""
Functions to generate and check tokens for the password
reset mechanism.
"""


def make_token(user):
    """Returns a token that can be used once to do a password reset
    for the given user.
    """
    return _make_token(user, int(time()))


def check_token(user, token, expire_after):
    """ Check that a password reset token is correct and still valid
    for a given user. "expire_after" must be in hours.
    """
    # Parse the token
    try:
        ts_b36, hash = token.split("$")
    except ValueError:
        return False
    try:
        ts = int(ts_b36, 36)
    except ValueError:
        return False
    # Check that the user/timestamp has not been tampered with
    if _make_token(user, ts) != token:
        return False
    # Check the timestamp is within limit
    if (time() - ts) > (expire_after * 3600):
        return False
    return True


def _make_token(user, timestamp):
    ts_b36 = web.to36(timestamp)

    # By hashing on the internal state of the user and using state
    # that is sure to change (the password hash and the last_login)
    # we produce a hash that will be invalid as soon as it --or the old
    # password-- is used.
    # By hashing also a secret key the system cannot be subverted
    # even if the database is compromised.
    items = [
        web.config.session_parameters.secret_key,
        unicode(user.id),
        u'@', user.password,
        unicode(user.last_login_at),
        unicode(timestamp),
    ]
    hash = sha(''.join(items)).hexdigest()
    return "%s$%s" % (ts_b36, hash)
