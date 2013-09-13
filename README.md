Stonegarden
===========

Simple CMS powered by web.py framework.


## Installation

### Install Python modules

1. `virtualenv venv` to init virual environment
2. `source venv/bin/activate` to activate virtual environment, note: you will have to run this everytime before working with CMS.
3. `pip install -r requirements.txt` to install required modules

### Install rubygems

Run `gem install bundler` and `bundle install --path venv/gems --binstubs venv/bin`, it will install required rubygems into your environment, so activating environment will enable `compass` console command.

### Configure database

Execute `fab setup` to init database schema and fill website with initial data, it will use sqlite by default.

To change database set DATABASE_URL environment variable like this: `DATABASE_URL=postgres://localhost/stonegarden fab setup`.

Setup will create user with the following credentials: user@example.com:111111.


## Running server

Run `fab server` to start webserver. It will start server with development environment on 8080 port.

To change environment and port set environment variables `WEBPY_ENV=production PORT=3333 fab server`.

Navigate to [http://localhost:8080/login](http://localhost:8080/login).


## Fab commands

Run `fab --list` to see all available commands.
