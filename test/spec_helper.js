var Docker = require('dockerode'),
    FactoryGirl = require('factory_girl'),
    utils = require('../lib/utils'),
    docker = require('../lib/docker');

FactoryGirl.definitionFilePaths = [__dirname + '/factories'];
FactoryGirl.findDefinitions();

var endpoint   = process.env.DOCKER_URL,
    certs      = process.env.DOCKER_CERT_PATH || '/home/.docker',
    repository = process.env.REPOSITORY || 'grounds';

var dockerClient = docker.getClient(endpoint, certs, repository);

// If client is not working, docker module tests are testing
// if getClient is working correctly.
dockerClient.ping(function(err) {
    if (err) {
        console.log(err);
        process.exit(1);
    }
});

// Should enforce websocket transport, otherwise polling will
// fail.
var socket = {
    port: 8080,
    URL: 'http://127.0.0.1:8080',
    options: { transports: ['websocket'], 'forceNew': true }
}

module.exports = {
    docker: dockerClient,
    FactoryGirl: FactoryGirl,
    socket: socket
};
