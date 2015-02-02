var Docker = require('dockerode'),
    validator = require('validator'),
    fs = require('fs'),
    path = require('path'),
    utils = require('./utils');

var ErrorInvalidEndpoint        = new Error('Please specify a valid Docker endpoint.'),
    ErrorInvalidRepository      = new Error('Please specify a valid Docker repository.'),
    ErrorInvalidCertsPath       = new Error('Please specify a valid Docker certs path.'),
    ErrorMissingKeyCertificate  = new Error('key.pem is missing.'),
    ErrorMissingCertCertificate = new Error('cert.pem is missing.'),
    ErrorMissingCaCertificate   = new Error('ca.pem is missing.'),
    ErrorAPINotResponding       = new Error('Docker API not responding.');

function validate(args, callback) {
    if (!validator.isURL(args.endpoint, { protocols: ['http', 'https'] })) {
        return callback(ErrorInvalidEndpoint);
    }
    if (!validator.isAlphanumeric(args.repository)) {
        return callback(ErrorInvalidRepository);
    }

    var certs = null;

    if (validator.isURL(args.endpoint, { protocols: ['https'] })) {
        if (!fs.existsSync(args.certs)) {
            return callback(ErrorInvalidCertsPath);
        }
        certs = getCertsFilePath(args.certs);

        if (!fs.existsSync(certs.key)) {
            return callback(ErrorMissingKeyCertificate);
        }
        if (!fs.existsSync(certs.cert)) {
            return callback(ErrorMissingCertCertificate);
        }
        if (!fs.existsSync(certs.ca)) {
            return callback(ErrorMissingCaCertificate);
        }
    }

    var client = getClient(args.endpoint, args.certs, args.repository);

    client.ping(function (err) {
        if (err) return callback(ErrorAPINotResponding);
        callback(null, client);
    });
}

function getClient(endpoint, certs, repository) {
    var dockerHost = utils.formatDockerHost(endpoint, certs),
        client     = new Docker(dockerHost);

    client.repository = repository;
    return client;
}

function getCertsFilePath(certsPath) {
    return {
        key: path.resolve(certsPath, 'key.pem'),
        cert: path.resolve(certsPath, 'cert.pem'),
        ca: path.resolve(certsPath, 'ca.pem')
    };
}

module.exports = {
    ErrorInvalidEndpoint: ErrorInvalidEndpoint,
    ErrorInvalidRepository: ErrorInvalidRepository,
    ErrorInvalidCertsPath: ErrorInvalidCertsPath,
    ErrorMissingKeyCertificate: ErrorMissingKeyCertificate,
    ErrorMissingCertCertificate: ErrorMissingCertCertificate,
    ErrorMissingCaCertificate: ErrorMissingCaCertificate,
    ErrorAPINotResponding: ErrorAPINotResponding,
    validate: validate,
}
