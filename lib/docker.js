var Docker = require('dockerode');

var DEFAULT_REPOSITORY = 'grounds',
    DEFAULT_TAG        = 'latest';

module.exports.getClient = function() {
    var client = new Docker();

    client.repository = process.env.REPOSITORY || DEFAULT_REPOSITORY;
    client.tag        = process.env.TAG        || DEFAULT_TAG;
    return client;
}
