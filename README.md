Stonegarden
===========

Simple CMS powered by web.py framework.

## Installation

1. Install all required modules with `pip install -r requirements.txt`
2. Create mysql database with `schema.sql`
3. Create `siteconfig.py` and set at least `database_url` to `mysql://user:password@host/database`
4. Execute `python setup.py` to fill database with initial data
5. Install node.js with coffeescript
6. Install sass, compass and zurb-foundation (version 3) rubygems
7. Watch and compile coffee and scss files with `cake watch`
8. Compile translations with `cake i18n:compile`


## Running

To run the website enter `python code.py`

## Node.js and coffeescript installation

	#install node
	brew install node
	#install npm
	curl http://npmjs.org/install.sh | sh
	#install coffee
	npm install -g coffee-script

## Rubygems installation

	gem install zurb-foundation -v 3.0.3


## Cakefile options

1. `cake watch` to watch and compile coffee and scss
2. `cake i18n:extract` to extract strings from code
3. `cake i18n:update` to update messages.po files
4. `cake i18n:compile` to compile translations to messages.mo files
