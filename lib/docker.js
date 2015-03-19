var Docker = require('dockerode'),
    validator = require('validator'),
    fs = require('fs'),
    utils = require('./utils');

var error = {
    InvalidEndpoint: new Error('Invalid Docker endpoint.'),
    InvalidCertsPath: new Error('Invalid Docker certs path.'),
    InvalidRepository: new Error('Invalid Docker repository.'),
    MissingKeyCertificate: new Error('key.pem is missing.'),
    MissingCertCertificate: new Error('cert.pem is missing.'),
    MissingCaCertificate : new Error('ca.pem is missing.'),
    DockerAPINotResponding: new Error('Docker API not responding.')
}

function validate(args, callback) {
    if (!validator.isURL(args.endpoint, { protocols: ['http', 'https'] })) {
        return callback(error.InvalidEndpoint);
    }
    if (!validator.isAlphanumeric(args.repository)) {
        return callback(error.InvalidRepository);
    }

    var certsFiles = null;

    if (validator.isURL(args.endpoint, { protocols: ['https'] })) {
        if (!fs.existsSync(args.certs)) {
            return callback(error.InvalidCertsPath);
        }
        certsFiles = utils.formatCertsFiles(args.certs);

        if (!fs.existsSync(certsFiles.key)) {
            return callback(error.MissingKeyCertificate);
        }
        if (!fs.existsSync(certsFiles.cert)) {
            return callback(error.MissingCertCertificate);
        }
        if (!fs.existsSync(certsFiles.ca)) {
            return callback(error.MissingCaCertificate);
        }
    }

    var client = getClient(args.endpoint, args.certs, args.repository);

    client.ping(function (err) {
        if (err) return callback(error.DockerAPINotResponding);
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
    validate: validate,
    getClient: getClient
}
