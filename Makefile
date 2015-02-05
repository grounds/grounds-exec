.PHONY: all re clean build run test push images images-push images-pull

REPOSITORY := $(if $(REPOSITORY),$(REPOSITORY),'grounds')
TAG        := $(if $(TAG),$(TAG),'latest')

compose := REPOSITORY=$(REPOSITORY) fig -p groundsexec

all: run

re: clean all

clean:
	$(compose) kill
	$(compose) rm --force

build:
	$(compose) build server

run: build
	$(compose) up server

test: build
	$(compose) run --rm server npm test

push: build
	scripts/push.sh $(REPOSITORY) $(TAG)

images:
	scripts/images.sh build $(REPOSITORY)

images-push: images
	scripts/images.sh push $(REPOSITORY)

images-pull:
	scripts/images.sh pull $(REPOSITORY)
