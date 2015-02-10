module.exports = Object.freeze({
    ServerPortInvalid: new Error('Server port invalid.'),
    DockerAPIInvalidEndpoint: new Error('Please specify a valid Docker endpoint.'),
    DockerAPIInvalidCertsPath: new Error('Please specify a valid Docker certs path.'),
    DockerAPIMissingKeyCertificate: new Error('key.pem is missing.'),
    DockerAPIMissingCertCertificate: new Error('cert.pem is missing.'),
    DockerAPIMissingCaCertificate : new Error('ca.pem is missing.'),
    DockerAPINotResponding: new Error('Docker API not responding.')
});
