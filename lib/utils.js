var fs = require('fs'),
    path = require('path'),
    url = require('url');

var imagesPrefix = 'exec';

module.exports.formatImage = function(registry, language) {
    if (!language) return '';

    var image = imagesPrefix + '-' + language;

    if (!registry) return image;
    return registry + '/' + image;
}

module.exports.formatCmd = function(code){
    if (!code) return '';
    return code.split('\\').join('\\\\')
               .split('\n').join('\\n')
               .split('\r').join('\\r')
               .split('\t').join('\\t');
}

module.exports.formatStatus = function(status) {
    if (status >= 128) status -= 256;
    return status;
}

module.exports.formatDockerHost = function(endpoint, certsFiles) {
    var u = url.parse(endpoint),
        host = {
            protocol: u.protocol.replace(':', ''),
            host: u.hostname,
            port: parseInt(u.port),
        };

    if (host.protocol === 'https') {
        host.key = fs.readFileSync(certsFiles.key);
        host.cert = fs.readFileSync(certsFiles.cert);
        host.ca = fs.readFileSync(certsFiles.ca);
    }
    return host;
}

module.exports.formatCertsFiles = function(certsPath) {
    if (!certsPath) return null;

    return {
        key: path.resolve(certsPath, 'key.pem'),
        cert: path.resolve(certsPath, 'cert.pem'),
        ca: path.resolve(certsPath, 'ca.pem')
    };
}
