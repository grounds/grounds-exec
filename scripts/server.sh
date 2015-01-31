#!/bin/sh
set -e

# Should be used only inside a grounds-exec container.
server -e $DOCKER_URL \
       -r $REPOSITORY
