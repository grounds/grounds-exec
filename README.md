# grounds-exec
[ ![Codeship Status for grounds/grounds-exec](https://codeship.io/projects/8bd7b600-2357-0132-4e4e-7e9ae55fd39f/status?branch=master)](https://codeship.io/projects/36679)

This project is a server with real-time bidirectional event-based communication,
used by [Grounds](http://beta.42grounds.io) to execute arbitry code within various
languages inside Docker containers.

grounds-exec support many languages and make it really trivial to add support
for other languages.

All you need is [Docker 1.3+](https://docker.com/), [Fig 1.0+](http://www.fig.sh/)
and [make](http://www.gnu.org/software/make/) to run this project inside Docker
containers with the same environment as in production.

## Languages
There is one Docker image for each language stack supported.

grounds-exec currently supports latest version of:

- C
- C++
- C#
- Elixir
- Go
- Haxe
- Java
- Node.js
- PHP
- Python 2 and 3
- Ruby
- Rust

Checkout this
[documentation](https://github.com/grounds/grounds-exec/blob/master/docs/NEW_LANGUAGE.md)
to get more informations about how to add support for a new language stack.

## Prerequisite
grounds-exec is using [socket.io](http://socket.io). This adds the ability
to run arbitrary code in real-time from a web browser.

Each `run` is executed inside a Docker container, which is destroyed at the end
of the `run`.

A container automatically timeouts 10 seconds after the beginning of a `run`.

If a `run` request is sent from the same client when a previous `run` request is
already running, this previous request will be gracefully interrupted.

### Build language stack images

    make images

The first build takes a lot of time. If you want you can also pull official
images:

    make images-pull

If you want to push these images to your own repository:

    REPOSITORY="<you repository>" make images-push

### Set Docker remote API url

You need to specify a docker remote API url to connect with.

    export DOCKER_URL="http://127.0.0.1:2375"

If your are using Docker API through `https`, your `DOCKER_CERT_PATH` will be
mounted has a volume inside the container.

>Be careful: boot2docker enforces tls verification since version 1.3.

## Socket.io server

### Start the server

    make run

You can also run the server in the background:

    make detach

Or:

    make

If the server is already running:

    make re

### Connect to the server

You need to use a [socket.io](http://socket.io/docs/client-api/) client to
connect with this server.

    var client = io.connect('http:<docker host ip>:8080');

### Send a run request

    client.on('connect', function(data) {
        client.on('run', function(data){
            console.log(data);
        });
        client.emit('run', { language: 'python2', code: 'print 42' });
    });

### Run response

* Format:

        { stream: 'stream', chunk: 'chunk' }

* Typical response:

        { stream: 'start',  chunk: '' }
        { stream: 'stdout', chunk: '42\n' }
        { stream: 'stderr', chunk: 'Error!\n' }
        { stream: 'status', chunk: 0 }

The server has a spam prevention against each `run` request. The minimum
delay between two run request is fixed to 0.5 seconds.

In this case, you will receive for each ignored request:

    { stream: 'ignored',  chunk: '' }

If an error occured during a `run`, you will receive:

    { stream: 'error', chunk: 'Error message' }

## Tests

Tests will also run inside Docker containers with the same environment
as the CI server.

To run the test suite:

    make test

To run specific test files or add a flag for [mocha](http://mochajs.org/) you
can specify `TEST_OPTS`:

    TEST_OPTS="test/utils.js" make test

## Contributing

Before sending a pull request, please checkout the contributing
[guidelines](/docs/CONTRIBUTING.md).

## Authors

See [authors](/docs/AUTHORS.md) file.

## Licensing

grounds-exec is licensed under the MIT License. See [LICENSE](LICENSE) for
full license text.
