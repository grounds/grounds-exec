#!/bin/sh

set -e

server -e $DOCKER_URL -p $PORT -r $REPOSITORY
