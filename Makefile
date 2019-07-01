serve:
	hugo server
build:
	scripts/build-site.sh
lint:
	scripts/lint-site.sh
install:
	npm install -g markdown-spellcheck mdl htmlproofer
