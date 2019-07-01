#!/bin/bash

echo -ne "mdspell "
mdspell --version
echo -ne "mdl "
mdl --version
htmlproofer --version

htmlproofer ./public --assume-extension --check-html --check-external-hash --check-opengraph --alt-ignore '/.*/' --timeframe 2d --storage-dir .htmlproofer --url-ignore "/localhost/,/groups.google.com/forum/"
