#!/bin/sh

set -e

repository="$1"
tag="$2"
image="$repository/grounds-exec:$tag"

if [ -z $repository ]; then
    echo "usage: deploy REPOSITORY TAG"
    return
fi

docker tag master_server $image
docker push $image
