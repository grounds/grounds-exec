var Docker = require('dockerode'),
    FactoryGirl = require('factory_girl'),
    utils = require('../lib/utils');

FactoryGirl.definitionFilePaths = [__dirname + '/factories'];
FactoryGirl.findDefinitions();

var dockerURL   = process.env.DOCKER_URL || 'http://127.0.0.1:2375',
    dockerCerts = process.env.DOCKER_CERT_PATH || '/home/.docker',
    dockerHost  = utils.formatDockerHost(dockerURL, dockerCerts),
    docker      = new Docker(dockerHost);

docker.repository = process.env.REPOSITORY || 'grounds';

docker.ping(function(err, data) {
    if (err) {
        console.log('Docker API not responding with docker host: ', dockerHost);
        process.exit(1);
    }
});

// If test suite runs inside containers
if (!!process.env.SERVER_PORT)
    var socketURL = process.env.SERVER_PORT.replace('tcp', 'http');
else
    var socketURL = 'http://localhost:8080';

module.exports = {
    socketURL: socketURL,
    docker: docker,
    dockerCerts: dockerCerts,
    FactoryGirl: FactoryGirl
};
