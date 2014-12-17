#!/bin/sh

set -e

command="$1"
repository="$2"
directory="dockerfiles"

get_images_dirs() {
    echo $(find $directory -maxdepth 1 -type d | grep $directory/)
}

get_image_name() {
    echo "$repository/$(echo $1 | cut -f2 -d "/")"
}

# Build local images
build() {
    docker build -t $(get_image_name $1) "$1"
}

# Push images to repository
push() {
    docker push $(get_image_name $1)
}

# Pull images from repository
pull() {
    docker pull $(get_image_name $1)
}

images() {
    # If first parameter from CLI is missing or empty
    if [ -z $command ] || [ -z $repository ]; then
        echo "usage: images [build|push|pull] REPOSITORY"
        return
    fi
    # For every images
    for image_dir in $(get_images_dirs); do
        # Launch function corresponding to first parameter from CLI
        eval $command "$image_dir"
    done
}

images
