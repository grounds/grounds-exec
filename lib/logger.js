var moment = require('moment');

module.exports.log = function() {
   Array.prototype.unshift.call(arguments, moment().format(), '-');
   console.log.apply(console, arguments);
}

module.exports.error = function() {
    Array.prototype.unshift.call(arguments, moment().format(), '-', 'Error:');
    console.error.apply(console, arguments);
}
