# grounds-exec
[![Circle CI](https://circleci.com/gh/grounds/grounds-exec/tree/master.svg?style=svg)](https://circleci.com/gh/grounds/grounds-exec/tree/master)
[![Code Climate](https://codeclimate.com/github/grounds/grounds-exec/badges/gpa.svg)](https://codeclimate.com/github/grounds/grounds-exec)
[![Test Coverage](https://codeclimate.com/github/grounds/grounds-exec/badges/coverage.svg)](https://codeclimate.com/github/grounds/grounds-exec)

This project is a server with real-time bidirectional event-based communication,
used by [Grounds](http://beta.42grounds.io) to execute arbitry code within various
languages inside Docker containers.

grounds-exec support many languages and make it really trivial to add support
for other languages.

All you need is [Docker 1.3+](https://docker.com/),
[Docker Compose 1.1+](http://docs.docker.com/compose/) and
[make](http://www.gnu.org/software/make/) to run this project inside Docker
containers with the same environment as in production.

## Languages

This project is language agnostic, the only mandatory thing is to have Docker
images following the format described in this
[repository](http://github.com/grounds/grounds-images).

Checkout this
[documentation](https://github.com/grounds/grounds-images/blob/master/docs/NEW_LANGUAGE.md)
to get more informations about how to add support for a new language stack.

## Prerequisite
grounds-exec is using [socket.io](http://socket.io). This adds the ability
to run arbitrary code in real-time from a web browser.

Each `run` is executed inside a Docker container, which is destroyed at the end
of the `run`.

A container automatically timeouts 10 seconds after the beginning of a `run`.

If a `run` request is sent from the same client when a previous `run` request is
already running, this previous request will be gracefully interrupted.

### Clone this project

    git clone https://github.com/grounds/grounds-exec.git

### Get into this project directory

    cd grounds-exec

### Get official images

Official Grounds language stack images are available on the Docker hub
Grounds [organization](https://registry.hub.docker.com/repos/grounds/).

e.g. To pull latest Ruby image:

    docker pull grounds/exec-ruby:latest

### Docker configuration

By default, the code runner will use your Docker host configuration to
creates containers.

If you want to use a different Docker host to creates code runners inside
containers you can also specify `DOCKER_HOST_RUNNERS`.

If you want to use SSL for both Docker hosts, they must share the same ssl
certificates.

## Socket.io server

### Start the server

    make run

You can also run the server in the background:

    make detach

Or:

    make

If the server is already running:

    make re

If you want [New Relic](http://newrelic.com/) metrics you can also specify:

* `NEWRELIC_LICENSE_KEY`
* `NEWRELIC_APP_NAME`

e.g. `NEWRELIC_LICENSE_KEY="<you license key>" NEWRELIC_APP_NAME="grounds-exec" make run`

If you want the server to look for custom Docker images, you can specify in your env:

* `TAG`: Image tag (**default**: latest).
* `REPOSITORY`: Image repository (**default**: grounds).

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

If an error occured during a `run`, you will receive:

    { stream: 'error', chunk: 'Error message' }

The server has a spam prevention against each `run` request. The minimum
delay between two run request is fixed to 0.5 seconds, otherwise you will
receive an error.

## Tests

Tests will also run inside Docker containers with the same environment
as the CI server.

You need to pull the official ruby image to run the test suite:

    docker pull grounds/exec-ruby

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
