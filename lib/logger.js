var moment = require('moment');

module.exports.log = function() {
    console.log.apply(console, shiftArgs(arguments));
}

module.exports.error = function() {
    console.error.apply(console, shiftArgs(arguments, 'Error:'));
}

function shiftArgs(args, customMsg) {
    var now = moment().format(),
        separator = '-';

    if (!customMsg)
        Array.prototype.unshift.call(args, now, separator);
    else
        Array.prototype.unshift.call(args, now, separator, customMsg);
    return args;
}
