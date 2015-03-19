.PHONY: all re clean build run detach test push

REPOSITORY := $(if $(REPOSITORY),$(REPOSITORY),'grounds')
TAG        := $(if $(TAG),$(TAG),'latest')

compose := REPOSITORY=$(REPOSITORY) docker-compose -p groundsexec

all: detach

re: build clean all

clean:
	$(compose) kill
	$(compose) rm --force

build:
	$(compose) build server

run: build
	$(compose) up

detach:
	$(compose) up -d

test: build
	$(compose) run server npm test

push:
	scripts/push.sh $(REPOSITORY) $(TAG)
