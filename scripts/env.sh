#!/bin/sh

if [ $DOCKER_RUNNERS_URL ]; then
    export DOCKER_HOST=$DOCKER_RUNNERS_URL
fi
