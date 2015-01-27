var Docker = require('dockerode'),
    validator = require('validator'),
    fs = require('fs'),
    path = require('path'),
    utils = require('./utils');

var invalidDockerEndpoint   = new Error('Please specify a valid Docker endpoint.'),
    invalidDockerRepository = new Error('Please specify a valid Docker repository.'),
    invalidDockerCertsPath  = new Error('Please specify a valid Docker certs path.'),
    missingKeyCertificate   = new Error('key.pem is missing.'),
    missingCertCertificate  = new Error('cert.pem is missing.'),
    missingCaCertificate    = new Error('ca.pem is missing.');

function validate(args, callback) {
    if (!validator.isURL(args.endpoint, { protocols: ['http', 'https'] })) {
        return callback(null, invalidDockerEndpoint);
    }
    if (!validator.isAlphanumeric(args.repository)) {
        return callback(null, invalidDockerRepository);
    }

    var certs = null;

    if (validator.isURL(args.endpoint, { protocols: ['https'] })) {
        if (!fs.existsSync(args.certs)) {
            return callback(null, invalidDockerCertsPath);
        }
        certs = this.getCerts(args.certs);

        if (!fs.existsSync(certs.key)) {
            return callback(null, missingKeyCertificate);
        }
        if (!fs.existsSync(certs.cert)) {
            return callback(null, missingCertCertificate);
        }
        if (!fs.existsSync(certs.key)) {
            return callback(null, missingCaCertificate);
        }
    }

    var client = this.getClient(args.endpoint, args.certs, args.repository);

    callback(client, null);
}

function getClient(endpoint, certs, repository) {
    var dockerHost = utils.formatDockerHost(endpoint, certs),
        client     = new Docker(dockerHost);

    client.repository = repository;
    return client;
}

function getCerts(certsPath) {
    return {
        key: path.resolve(certsPath, 'key.pem'),
        cert: path.resolve(certsPath, 'cert.pem'),
        ca: path.resolve(certsPath, 'ca.pem')
    };
}

module.exports = {
    invalidDockerEndpoint: invalidDockerEndpoint,
    invalidDockerRepository: invalidDockerRepository,
    invalidDockerCertsPath: invalidDockerCertsPath,
    missingKeyCertificate: missingKeyCertificate,
    missingCertCertificate: missingCertCertificate,
    missingCaCertificate: missingCaCertificate,
    validate: validate,
    getClient: getClient,
    getCerts: getCerts
}
