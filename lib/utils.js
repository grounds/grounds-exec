var fs = require('fs'),
    url = require('url');
    
var imagePrefix = 'exec';

function formatImage(registry, language) {
    if (!language) return "";

    var image = imagePrefix + "-" + language;

    if (!registry)
        return image;
    return registry + "/" + image;
}

function formatCmd(code) {
    return code.split("\\").join("\\\\")
               .split("\n").join("\\n")
               .split("\r").join("\\r")
               .split("\t").join("\\t");
}

function formatStatus (status) {
    if (status >= 128) status -= 256;
    return status;
}

function formatDockerHost(endpoint) {
    var u = url.parse(endpoint),
        host = {
            protocol: u.protocol.replace(':', ''),
            host: u.hostname,
            port: parseInt(u.port),
        };

    if (host.protocol === 'https') {
        host.key = fs.readFileSync('/home/.docker/key.pem');
        host.cert = fs.readFileSync('/home/.docker/cert.pem');
        host.ca = fs.readFileSync('/home/.docker/ca.pem');
    }
    return host;
}

module.exports = {
    formatImage: formatImage,
    formatCmd: formatCmd,
    formatStatus: formatStatus,
    formatDockerHost: formatDockerHost
}
