var Docker = require('dockerode');

var DEFAULT_REPOSITORY = 'grounds',
    DEFAULT_TAG        = 'latest';

var client = new Docker();

module.exports.getClient = function() {
    client.repository = process.env.REPOSITORY || DEFAULT_REPOSITORY;
    client.tag        = process.env.TAG        || DEFAULT_TAG;
    return client;
}
