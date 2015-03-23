#!/bin/sh
set -e

if [ $DOCKER_RUNNERS_URL ]; then
    url=$DOCKER_RUNNERS_URL
else
    url=$DOCKER_URL
fi

echo $url

# Should be used only inside a grounds-exec container.
server -e $url \
       -r $REPOSITORY
