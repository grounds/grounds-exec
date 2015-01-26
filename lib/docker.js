var Docker = require('dockerode')
    utils = require('./utils');

module.exports.getClient = function(endpoint, certs, repository) {
    var dockerHost = utils.formatDockerHost(endpoint, certs),
        client = new Docker(dockerHost);
    client.ping(function(err, data) {
        if (err) throw err;
    });
    client.repository = repository;
    return client;
}
