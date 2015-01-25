.PHONY: all re clean build run test push images images-push images-pull

REPOSITORY := $(if $(REPOSITORY),$(REPOSITORY),'grounds')
TAG 	   := $(if $(TAG),$(TAG),'latest')

all: run

re: clean all

clean:
	fig kill
	fig rm --force

build:
	fig -p groundsexec build server

run: build
	fig up server

test: clean build
	fig up -d server
	fig run server npm test

push: build
	hack/push.sh $(REPOSITORY) $(TAG)

images:
	hack/images.sh build $(REPOSITORY)

images-push: images
	hack/images.sh push $(REPOSITORY)

images-pull:
	hack/images.sh pull $(REPOSITORY)
