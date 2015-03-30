var fs = require('fs'),
    path = require('path'),
    url = require('url');

var IMAGE_PREFIX = 'exec';

module.exports.formatImage = function(registry, language) {
    if (!language) return '';

    var image = IMAGE_PREFIX + '-' + language;

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
