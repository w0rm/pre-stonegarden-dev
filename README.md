Stonegarden
===========

Simple CMS powered by web.py framework.

## Installation

1. Install all required modules with `pip install -r requirements.txt`
2. Install sass, compass and zurb-foundation (version 4) rubygems with `gem install compass zurb-foundation`
3. Create mysql database
4. Create `siteconfig.py` and set at least `database_url` to `mysql://user:password@host/database`
5. Compile scss files with `fab compile`
6. Compile translations with `fab i18n_compile`
7. Execute `fab setup` to init database schema and fill website with initial data
8. Run `fab server` to start webserver

## Running

To run the webserver enter `python code.py`

## Fab commands

1. `fab watch` to watch and compile scss
2. `fab compile` to compile scss
3. `fab i18n_extract` to extract strings from code
4. `fab i18n_update` to update messages.po files
5. `fab i18n_compile` to compile translations to messages.mo files
6. `fab server` to start webserver
