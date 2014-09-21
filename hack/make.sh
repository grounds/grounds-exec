#!/bin/sh

set -e

# Set default docker repository if none exist in env
if [ -z $REPOSITORY ]; then
    REPOSITORY="grounds"
fi

# Set default docker url if none exist in env
if [ -z $DOCKER_URL ]; then
    DOCKER_URL="http://127.0.0.1:2375"
fi

# Set default port to serve if none exist in env
if [ -z $PORT ]; then
    PORT="8080"
fi


GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)

IMAGE="$REPOSITORY/grounds-exec:$GIT_BRANCH"
CONTAINER="grounds-exec"

BUILD="docker build -t"
CLEAN="docker rm --force $CONTAINER"
DETACH="docker run -d --name $CONTAINER --expose $PORT"
RUN="docker run -ti"

build() {
    ${BUILD} "$IMAGE" .
}

clean() {
    if [ $(container_created) ]; then
        ${CLEAN}
    fi
}

detach() {
    ${DETACH} "$IMAGE" server -e "$DOCKER_URL" -p "$PORT" -r "$REPOSITORY"
}

run() {
    ${RUN} -p $PORT:$PORT "$IMAGE" server -e "$DOCKER_URL" -p "$PORT" -r "$REPOSITORY"
}

test() {
    ${RUN} -e "DOCKER_URL=$DOCKER_URL" --link $CONTAINER:$CONTAINER "$IMAGE" npm test
}

container_created() {
    echo $(docker inspect --format={{.Created}} "$CONTAINER" 2>/dev/null)
}

main() {
    # If first parameter is missing or empty
    if [ -z $1 ]; then
        echo "usage: make [build|clean|detach|run|test]"
        return
    fi
    eval $1
}

main "$1"
