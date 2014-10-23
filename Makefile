.PHONY: build clean run test deploy images images-push images-pull

REPOSITORY := $(if $(REPOSITORY),$(REPOSITORY),'grounds')

build:
	fig -p groundsexec build image

clean:
	fig kill
	
run: build
	fig up server

test: build
	fig run test

deploy: build
	hack/deploy.sh

images:
	hack/images.sh build $(REPOSITORY)

images-push: images
	hack/images.sh push $(REPOSITORY)

images-pull:
	hack/images.sh pull $(REPOSITORY)


