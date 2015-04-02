var fs = require('fs'),
    path = require('path'),
    url = require('url');

var IMAGE_PREFIX = 'exec';

module.exports.formatImage = function(repository, language, tag) {
    if (!language || !tag) return '';

    var image = IMAGE_PREFIX + '-' + language + ':' + tag;

    if (!repository) return image;

    return repository + '/' + image;
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
