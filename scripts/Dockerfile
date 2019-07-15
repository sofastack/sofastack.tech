FROM alpine:3.9

MAINTAINER Jimmy Song <rootsongjc@gmail.com>

RUN apk add --no-cache bash git curl jq tar libc6-compat g++

RUN apk add --no-cache nodejs-current-npm && npm install -g markdown-spellcheck webpack webpack-cli

RUN apk add --no-cache ruby ruby-dev ruby-rdoc && gem install mdl

# Install hugo v0.55.5 extended
ADD https://github.com/gohugoio/hugo/releases/download/v0.55.5/hugo_extended_0.55.5_Linux-64bit.tar.gz /

RUN tar xvf hugo_extended_0.55.5_Linux-64bit.tar.gz && rm -rf hugo_extended_0.55.5_Linux-64bit.tar.gz

RUN mv /hugo /usr/local/bin/
