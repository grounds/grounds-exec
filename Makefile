.PHONY: build clean detach run test images images-push images-pull

build:
	hack/make.sh build

clean:
	hack/make.sh clean

detach: build clean
	hack/make.sh detach
	
run: build
	hack/make.sh run
	
test: detach
	hack/make.sh test
	hack/make.sh clean

images:
	hack/images.sh build

images-push: images
	hack/images.sh push

images-pull:
	hack/images.sh pull


