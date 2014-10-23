.PHONY: build clean detach run test deploy images images-push images-pull

PORT 	   := $(if $(PORT),$(PORT),8080)
REPOSITORY := $(if $(REPOSITORY),$(REPOSITORY),'grounds')

RUN_OPTS   := "-e $(DOCKER_URL) -p $(PORT) -r $(REPOSITORY)"

build:
	fig build image

clean:
	fig kill

detach: build
	fig run -d server $(RUN_OPTS)
	
run: build
	fig run server $(RUN_OPTS)	

test: detach
	fig run test

deploy: build
	hack/deploy.sh

images:
	hack/images.sh build $(REPOSITORY)

images-push: images
	hack/images.sh push $(REPOSITORY)

images-pull:
	hack/images.sh pull $(REPOSITORY)


