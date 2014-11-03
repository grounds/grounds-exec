# Add a new language stack

Each language stack has its own Docker image used to execute code inside
a Docker container.

These images can be found inside the `dockerfiles` directory:

```
dockerfiles
│
├───exec-ruby
│   │   Dockerfile
│   │   run.sh
│
│
└───exec-golang
    │   Dockerfile
    │   run.sh
```

Each image has a directory called `exec-$language`.
Inside this directory there is two files:

- A `Dockerfile` to build the image.
- A shell script `run.sh` that must be copied inside the image.

Images are built has an executable Docker image. This allow us to do:

    $ docker run grounds/exec-ruby "puts 42"
    42

## Create an image

Creating an image for a new language is really trivial.
Take a look at this example for the C language:

Create the directory:

    mkdir dockerfiles/exec-c

Add a `Dockerfile` and a shell script inside this directory:

    touch dockerfiles/exec-c/Dockerfile
    touch dockerfiles/exec-c/run.sh
    chmod u+x dockerfiles/exec-c/run.sh

### Inside the Dockerfile:

Checkout first [here](https://github.com/docker-library). If there is an official image for the language
stack you are trying to add, just inherit from the latest tag of the official image and skip to step 4:

    FROM python:latest

If there is no official image for this language stack:

1. Base the image on the official ubuntu image:

        FROM ubuntu:14.04

2. Update ubuntu package manager:

        RUN apt-get update -qq

3. Install dependencies required to compile C code (e.g `gcc`)

        RUN apt-get -qy install \
            build-essential \
            gcc

4. Copy the script `run.sh` inside the `/home/dev` directory:

        COPY run.sh /home/dev/run.sh

5. Add a user and give him access to `/home/dev`

        RUN useradd dev
        RUN chown -R dev: /home/dev

6. Switch user and working directory:

        USER dev
        WORKDIR /home/dev

        ENTRYPOINT ["/home/dev/run.sh"]

When you run a Docker container with this image:

- The default `pwd` of this container will be `/home/dev`.
- The user of this container will be `dev`
- This container will run `run.sh` and takes as parameter a string whith arbitrary code inside.

### Inside the shell script:

1. Add sh shebang line:

        #!/bin/sh

2. Echo first parameter from CLI to a file runnable by the language compiler/interpreter:

         echo "$1" > prog.c

    Please don't forget to surround `$1` with quotation marks, to avoid unexpected behaviors.

3. Compile and/or run the program:

        gcc -o prog prog.c

        if [ -f "prog" ]
        then
          ./prog
        fi

### Build the image

Build the image like you usually do with Docker:

    $ docker build -t grounds/exec-c dockerfiles/exec-c

### Tests

To add this language to the test suite:

1. Create a directory with the language code inside `examples/code`

    e.g. For PHP:

        mkdir examples/code/php

2. In this directory add two files with the appropriate file extension:

    * A code example who writes `"Hello world\n"` on `stdout`.
    * A code example who writes `"Hello stderr\n"` on `stderr`.

You can find great examples on
[Rosetta code](http://rosettacode.org/wiki/Hello_world).

3. Add this language code in `test/factories/examples.js`:

        var languages = ['c', 'cpp', 'php'];

4. Run the test suite

**Thanks for your contribution!**
