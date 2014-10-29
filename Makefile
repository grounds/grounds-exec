.PHONY: build clean run test push images images-push images-pull

REPOSITORY := $(if $(REPOSITORY),$(REPOSITORY),'grounds')
TAG 	   := $(if $(TAG),$(TAG),'latest')

build:
	fig -p groundsexec build image

clean:
	fig kill
	fig rm --force
	
run: build
	fig up server

test: clean build
	fig up test

push: build
	hack/push.sh $(REPOSITORY) $(TAG)

images:
	hack/images.sh build $(REPOSITORY)

images-push: images
	hack/images.sh push $(REPOSITORY)

images-pull:
	hack/images.sh pull $(REPOSITORY)


