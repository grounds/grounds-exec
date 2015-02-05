var Docker = require('dockerode'),
    validator = require('validator'),
    fs = require('fs'),
    utils = require('./utils')
    errors = require('./errors');

function validate(args, callback) {
    if (!validator.isURL(args.endpoint, { protocols: ['http', 'https'] })) {
        return callback(errors.DockerAPIInvalidEndpoint);
    }
    if (!validator.isAlphanumeric(args.repository)) {
        return callback(errors.DockerAPIInvalidRepository);
    }

    var certsFiles = null;

    if (validator.isURL(args.endpoint, { protocols: ['https'] })) {
        if (!fs.existsSync(args.certs)) {
            return callback(errors.DockerAPIInvalidCertsPath);
        }
        certsFiles = utils.formatCertsFiles(args.certs);

        if (!fs.existsSync(certsFiles.key)) {
            return callback(errors.DockerAPIMissingKeyCertificate);
        }
        if (!fs.existsSync(certsFiles.cert)) {
            return callback(errors.DockerAPIMissingCertCertificate);
        }
        if (!fs.existsSync(certsFiles.ca)) {
            return callback(errors.DockerAPIMissingCaCertificate);
        }
    }

    var client = getClient(args.endpoint, args.certs, args.repository);

    client.ping(function (err) {
        if (err) return callback(errors.DockerAPINotResponding);
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
