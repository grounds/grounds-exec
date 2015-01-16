var Docker = require('dockerode')
    utils = require('../lib/utils');

module.exports = function(endpoint, certs, repository) {
    var dockerHost = utils.formatDockerHost(endpoint, certs),
        docker     = new Docker(dockerHost);

    docker.ping(function(err, data) {
        if (err) throw 'Docker API not responding on '+dockerHost+'.';
    });
    docker.repository = repository;
    return docker;
}
