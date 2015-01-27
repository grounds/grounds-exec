var Docker = require('dockerode'),
    validator = require('validator'),
    fs = require('fs'),
    path = require('path'),
    utils = require('./utils');

module.exports.validate = function (args, callback) {
    if (!validator.isURL(args.endpoint, { protocols: ['http', 'https'] })) {
        return callback(null, 'Please specify a valid Docker endpoint.');
    }
    if (!validator.isAlphanumeric(args.repository)) {
        return callback(null, 'Please specify a valid Docker repository.');
    }

    var certs = null;

    if (validator.isURL(args.endpoint, { protocols: ['https'] })) {
        if (!fs.existsSync(args.certs)) {
            return callback(null, 'Please specify a valid Docker certs path.');
        }
        certs = this.getCerts(args.certs);

        if (!fs.existsSync(certs.key)) {
            return callback(null, 'key.pem is missing.');
        }
        if (!fs.existsSync(certs.cert)) {
            return callback(null, 'cert.pem is missing.');
        }
        if (!fs.existsSync(certs.key)) {
            return callback(null, 'ca.pem is missing.');
        }
    }
    callback(this.getClient(args.endpoint, args.certs, args.repository), null);
}

module.exports.getClient = function(endpoint, certs, repository) {
    var dockerHost = utils.formatDockerHost(endpoint, certs),
        client     = new Docker(dockerHost);

    client.repository = repository;
    return client;
}

module.exports.getCerts = function(certsPath) {
    return {
        key: path.resolve(certsPath, 'key.pem'),
        cert: path.resolve(certsPath, 'cert.pem'),
        ca: path.resolve(certsPath, 'ca.pem')
    };
}
