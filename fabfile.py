from fabric.api import task, run, local


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
