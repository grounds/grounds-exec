var Docker = require('dockerode');

var DEFAULT_REPOSITORY = 'grounds';

module.exports.getClient = function() {
    var client = new Docker();

    client.repository = process.env.REPOSITORY || DEFAULT_REPOSITORY;
    return client;
}
