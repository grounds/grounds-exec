#!/bin/sh

set -e

repository="$1"
tag="$2"
image="$repository/grounds-exec:$tag"

if [ -z $repository ]; then
    echo "usage: deploy REPOSITORY TAG"
    return
fi

docker tag groundsexec_image $image
docker push $image
