var url = require('url');
    
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
    if (status >= 128)
        status -= 256;
    return status;
}

function formatDockerURL(endpoint) {
    var u = url.parse(endpoint);

    return { host: u.protocol + '//' + u.hostname, port: parseInt(u.port) };
}

module.exports = {
    formatImage: formatImage,
    formatCmd: formatCmd,
    formatStatus: formatStatus,
    formatDockerURL: formatDockerURL
}
