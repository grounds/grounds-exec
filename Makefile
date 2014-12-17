.PHONY: all re clean build run test push images images-push images-pull

REPOSITORY := $(if $(REPOSITORY),$(REPOSITORY),'grounds')
TAG 	   := $(if $(TAG),$(TAG),'latest')
TEST_OPTS := $(if $(TEST_OPTS),$(TEST_OPTS),'--recursive')

all: run

re: clean all

clean:
	fig kill
	fig rm --force

build:
	fig -p groundsexec build image

run: build
	fig up server

# There is a bug with tests output and fig run,
# therefore test should be run within its own
# service.
test: clean build
	TEST_OPTS=$(TEST_OPTS) fig up test

push: build
	hack/push.sh $(REPOSITORY) $(TAG)

images:
	hack/images.sh build $(REPOSITORY)

images-push: images
	hack/images.sh push $(REPOSITORY)

images-pull:
	hack/images.sh pull $(REPOSITORY)
