import os
import shutil
import json
import web
from config import config
from base import db, auth
from models.tree import create_tree_branch
from fabric.api import task, local


@task
def watch():
    '''Watches for changes in scss and compiles them to css'''
    local('compass watch templates/scss')


@task
def compile():
    '''Compiles scss to css'''
    local('compass compile templates/scss')


@task
def i18n_extract():
    '''Exctracts messages for translation'''
    local('python i18n/extract-messages.py')


@task
def i18n_update():
    '''Updates dictionary with new messages'''
    local('pybabel update --ignore-obsolete -i i18n/messages.pot -d i18n/')


@task
def i18n_compile():
    '''Compiles dictionary files'''
    local('pybabel compile -d i18n/ -f --statistics')


@task
def server(port='8080'):
    '''Runs server'''
    local('python code.py %s' % port)


@task
def lint():
    '''Runs flake8'''
    local('flake8 .')


@task
def setup():
    '''Creates database schema and fills website with initial data'''

    shutil.rmtree(config.upload_dir, True)
    os.mkdir(config.upload_dir)
    shutil.rmtree(config.static_dir + '/i', True)
    os.mkdir(config.static_dir + '/i')

    schema_commands = open('schema.sql', 'r').read().split(';')
    for cmd in schema_commands:
        if cmd.strip():
            db.query(cmd)

    data = web.storage(json.loads(open('data.json', 'r').read()))
    now = web.db.SQLLiteral('CURRENT_TIMESTAMP')
    user = auth.create_user(**data.user)

    # System root folder
    db.insert(
        'documents',
        user_id=user.id,
        created_at=now,
        **data.documents_root
    )

    for p in data.pages:
        block = p.pop('block')
        page_id = db.insert(
            'pages',
            is_published=False,
            is_navigatable=True,
            user_id=user.id,
            created_at=now,
            **p
        )
        create_tree_branch(
            'blocks',
            block,
            page_id=page_id,
            user_id=user.id,
            is_published=True,
            created_at=now,
            published_at=now,
        )

    for block in data.template_blocks:
        create_tree_branch(
            'blocks',
            block,
            user_id=user.id,
            is_published=True,
            created_at=now,
            published_at=now,
        )
