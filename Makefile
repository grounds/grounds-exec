.PHONY: all re clean build run test push images images-push images-pull

REPOSITORY := $(if $(REPOSITORY),$(REPOSITORY),'grounds')
TAG        := $(if $(TAG),$(TAG),'latest')

compose := fig -p groundsexec

all: run

re: clean all

clean:
	$(compose) kill
	$(compose) rm --force

build:
	$(compose) build  server

run: build
	$(compose) up server

test: clean build
	$(compose) up -d server
	$(compose) run server npm test

push: build
	hack/push.sh $(REPOSITORY) $(TAG)

images:
	hack/images.sh build $(REPOSITORY)

images-push: images
	hack/images.sh push $(REPOSITORY)

images-pull:
	hack/images.sh pull $(REPOSITORY)
