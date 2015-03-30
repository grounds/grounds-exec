var RunHandler = require('./run');

module.exports.bind = function(socket) {
    var _ = new RunHandler(socket);
}
