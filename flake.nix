{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-23.11";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = { flake-utils, nixpkgs, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config = {
            allowBroken = true;
            permittedInsecurePackages = [
              "python-2.7.18.7"
              "python-2.7.18.7-env"
              "ruby-2.7.8"
              "openssl-1.1.1w"
            ];
          };
        };

        python = pkgs.python2.withPackages (python-pkgs: [
          python-pkgs.pip
          python-pkgs.setuptools
          python-pkgs.wheel
        ]);

        postgresConf =
          pkgs.writeText "postgresql.conf"
            ''
              # Add Custom Settings
              log_min_messages = warning
              log_min_error_statement = error
              log_min_duration_statement = 100  # ms
              log_connections = on
              log_disconnections = on
              log_duration = on
              #log_line_prefix = '[] '
              log_timezone = 'UTC'
              log_statement = 'all'
              log_directory = 'pg_log'
              log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
              logging_collector = on
              log_min_error_statement = error
            '';

      in
      {
        devShells.default = with pkgs; mkShell {
          buildInputs = [
            python
            ruby_2_7
            postgresql_12
            libffi
            openssl_1_1
            zlib
            libjpeg
            pkg-config
          ];

          shellHook = ''
            export PIP_PREFIX="$(pwd)/venv"
            export PYTHONPATH="$(pwd)/venv/lib/python2.7/site-packages:$PYTHONPATH"
            export PATH="$(pwd)/venv/bin:$PATH"
            export BUNDLE_PATH="$(pwd)/venv/gems"
            export BUNDLE_BIN="$(pwd)/venv/bin"

            # Uncomment this to setup and run the local postgres
            # This creates and starts the postgres db (user `postgres` without a password).
            # You can connect to it with `psql -U postgres` and `CREATE DATABASE stonegarden`.
            # Then run `DATABASE_URL=postgres://postgres@localhost/stonegarden fab setup`.
            # The db can be stopped with `pg_ctl stop`.

            # export PGDATA="$(pwd)/venv/pg"
            # export PGHOST="$PGDATA"
            # [ ! -d $PGDATA ] && pg_ctl initdb -o "-U postgres" && cat "$postgresConf" >> $PGDATA/postgresql.conf
            # pg_ctl -o "-p 5432 -k $PGDATA" start
          '';
        };
      }
    );
}
