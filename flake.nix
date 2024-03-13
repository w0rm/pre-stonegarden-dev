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
      in
      {
        devShells.default = with pkgs; mkShell {
          buildInputs = [
            python
            ruby_2_7
            postgresql_12
            mariadb-connector-c
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
          '';
        };
      }
    );
}
