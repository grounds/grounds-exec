var fs = require('fs'),
    url = require('url'),
    path = require('path');

var imagePrefix = 'exec';

module.exports.formatImage = function(registry, language) {
    if (!language) return '';

    var image = imagePrefix + '-' + language;

    if (!registry) return image;
    return registry + '/' + image;
}

module.exports.formatCmd = function(code){
    return code.split('\\').join('\\\\')
               .split('\n').join('\\n')
               .split('\r').join('\\r')
               .split('\t').join('\\t');
}

module.exports.formatStatus = function(status) {
    if (status >= 128) status -= 256;
    return status;
}

module.exports.formatDockerHost = function(endpoint, certs) {
    var u = url.parse(endpoint),
        host = {
            protocol: u.protocol.replace(':', ''),
            host: u.hostname,
            port: parseInt(u.port),
        };

    if (host.protocol === 'https') {
        host.key = fs.readFileSync(path.resolve(certs, 'key.pem'));
        host.cert = fs.readFileSync(path.resolve(certs, 'cert.pem'));
        host.ca = fs.readFileSync(path.resolve(certs, 'ca.pem'));
    }
    return host;
}
