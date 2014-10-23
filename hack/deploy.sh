#!/bin/sh

set -e

repository="$1"
image="$repository/grounds-exec:latest"

deploy() {
    if [ -z $repository ]; then
        echo "usage: deploy REPOSITORY"
        return
    fi

    docker tag groundsexec_image $image
    docker push $image
}

deploy
