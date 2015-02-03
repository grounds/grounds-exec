var Docker = require('dockerode'),
    validator = require('validator'),
    fs = require('fs'),
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

    var certsFiles = null;

    if (validator.isURL(args.endpoint, { protocols: ['https'] })) {
        if (!fs.existsSync(args.certs)) {
            return callback(ErrorInvalidCertsPath);
        }
        certsFiles = utils.formatCertsFiles(args.certs);

        if (!fs.existsSync(certsFiles.key)) {
            return callback(ErrorMissingKeyCertificate);
        }
        if (!fs.existsSync(certsFiles.cert)) {
            return callback(ErrorMissingCertCertificate);
        }
        if (!fs.existsSync(certsFiles.ca)) {
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
    var certsFiles = utils.formatCertsFiles(certs),
        host       = utils.formatDockerHost(endpoint, certsFiles),
        client     = new Docker(host);

    client.repository = repository;
    return client;
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
    getClient: getClient
}
