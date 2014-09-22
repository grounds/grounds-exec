# grounds-exec
[ ![Codeship Status for grounds/grounds-exec](https://codeship.io/projects/8bd7b600-2357-0132-4e4e-7e9ae55fd39f/status?branch=master)](https://codeship.io/projects/36679)

This project is a server with real-time bidirectional event-based communication, 
used by [Grounds](http://beta.42grounds.io) to execute arbitry code within various
languages inside `docker` containers.

`grounds-exec` support many languages and make it really trivial to add support
for other languages.

## Docker images

There is one `docker` image for each language stack supported.

Checkout images
[documentation](https://github.com/grounds/grounds-exec/blob/master/docs/IMAGES.md)
to have more informations about how they are built and how to create your own
compatible image.

## Server

All you need is `docker` and `make` to run your own server.

This project is using [socket.io](http://socket.io). This adds the ability 
to run arbitrary code in real-time from any web browser.

Each `run` is executed inside a `docker` container, which is destroyed at the end
of the `run`.

A container automatically timeouts 10 seconds after the beginning of a `run`.

If a `run` request is sent from the same client when a previous `run` request is
already running, this previous request will be gracefully interrupted.

### First build the docker images

    make images
    
The first build takes a lot of time. If you want you can also pull official images:

    make images-pull
    
If you want to push this images to your own repository:
    
    REPOSITORY="<you repository>" make images-push
    
### Launch you own server

You need to specify a docker remote API url to connect with.

    DOCKER_URL="http://127.0.0.1:2375" make run

### Connect to the server

    var client = io.connect('http://localhost:8080');

### Send a run request

    client.on('connect', function(data) {
        client.on('run', function(data){
            console.log(data);
        });
        client.emit('run', { language: 'python2', code: 'print 42' });
    });
    
### Run response

Format:

    { stream: 'stream', chunk: 'chunk' }
    
Typicall response:

    { stream: 'start',  chunk: '' }
    { stream: 'stdout', chunk: '42\n' }
    { stream: 'stderr', chunk: 'Error!\n' }
    { stream: 'status', chunk: 0 }

The server has a spam prevention against each `run` request. The minimum 
delay between two run request is fixed to 0.5 seconds.

If this is the case, you will receive for each ignored request:

    { stream: 'ignored',  chunk: '' }

### Tests

Tests will also run inside `docker` containers with the same environment
used by the CI server.

If you want to run the test suite, you need to specify a docker remote API url
to connect with.

eg: If you're using `boot2docker` on `darwin`:

    DOCKER_URL="http://192.168.59.103:2375" make test

## Contributing

Before sending a pull request, please checkout the contributing
[guidelines](https://github.com/grounds/grounds-exec/blob/master/docs/CONTRIBUTING.md).

## Licensing

`grounds-exec` is licensed under the MIT License. See `LICENSE` for full license
text.
