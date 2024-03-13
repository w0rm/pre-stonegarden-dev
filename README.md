# Stonegarden

Simple CMS powered by web.py framework. Work-in progress/

## Local development with nix

1. install [nix](https://nixos.org/download/) and add `experimental-features = nix-command flakes` to `~/.config/nix/nix.conf`
2. `nix develop` to enter nix shell
3. `pip install -r frozen-requirements.txt` to install python packages
4. `bundle install` to install rubygems
5. `fab setup` to create the db
6. `fab server` to start the local server (open http://localhost:8080/login and login with user@example.com:111111)

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
