var Docker = require('dockerode'),
    FactoryGirl = require('factory_girl'),
    utils = require('../lib/utils');

FactoryGirl.definitionFilePaths = [__dirname + '/factories'];
FactoryGirl.findDefinitions();

var endpoint   = process.env.DOCKER_URL || 'http://127.0.0.1:2375',
    certs = process.env.DOCKER_CERT_PATH || '/home/.docker',
    repository = process.env.REPOSITORY || 'grounds';
    docker = require('../lib/docker').getClient(endpoint, certs, repository);

// If test suite runs inside containers
if (!!process.env.SERVER_PORT)
    var socketURL = process.env.SERVER_PORT.replace('tcp', 'http');
else
    var socketURL = 'http://localhost:8080';

module.exports = {
    socketURL: socketURL,
    docker: docker,
    dockerCerts: certs,
    FactoryGirl: FactoryGirl
};
