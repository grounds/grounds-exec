#!/bin/sh

set -e

server -e $DOCKER_URL \
       -p $PORT \
       -r $REPOSITORY \
       -c $DOCKER_CERT_PATH
