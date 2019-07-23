#!/bin/bash
echo "Install dependencies"
./scripts/install-dependency.sh
./scripts/build-site.sh
echo -ne "mdspell "
mdspell --version
echo -ne "mdl "
mdl --version
htmlproofer --version
htmlproofer ./public --assume-extension --check-html --check-external-hash --check-opengraph --alt-ignore '/.*/' --timeframe 2d --storage-dir .htmlproofer --url-ignore "/localhost/,/groups.google.com/forum/,/metrics20.org/,/static.javadoc.io/"
