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

module.exports = {
    docker: dockerClient,
    FactoryGirl: FactoryGirl,
};
