#!/bin/sh
set -e

# This variable is used to override DOCKER_HOST, without having
# docker-compose running this application container on the wrong
# docker host.
if [ $DOCKER_HOST_RUNNERS ]; then
    export DOCKER_HOST=$DOCKER_HOST_RUNNERS
fi

# docker-compose is adding an empty env variable even if
# the client has not set these variables.
#
# This script purpose is to override invalid values set by
# docker-compose in this case.

# Remove tls env if tls not required.
#
# We also need to remove DOCKER_CERT_PATH, dockerode does not check
# DOCKER_TLS_VERIFY and use DOCKER_CERT_PATH anyway.
if [ ! $DOCKER_TLS_VERIFY ]; then
    unset DOCKER_TLS_VERIFY
    unset DOCKER_CERT_PATH
fi
