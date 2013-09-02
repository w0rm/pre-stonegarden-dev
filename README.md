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
9. Navigate to [http://localhost:8080/login](http://localhost:8080/login) and use these credentials to login: user@example.com:111111

## Fab commands

Run `fab --list` to see all available commands.
