Stonegarden
===========

Simple CMS powered by web.py framework.

## Installation

1. Install all required modules with `pip install -r requirements.txt`
2. Create mysql database
3. Create `siteconfig.py` and set at least `database_url` to `mysql://user:password@host/database`
4. Execute `python setup.py` to fill database with initial data
5. Install sass, compass and zurb-foundation (version 4) rubygems with `gem install compass zurb-foundation`
6. Compile scss files with `fab compile`
7. Compile translations with `fab i18n_compile`

## Running

To run the webserver enter `python code.py`

## Fab commands

1. `fab watch` to watch and compile scss
2. `fab compile` to compile scss
3. `fab i18n_extract` to extract strings from code
4. `fab i18n_update` to update messages.po files
5. `fab i18n_compile` to compile translations to messages.mo files
6. `fab server` to run webserver
