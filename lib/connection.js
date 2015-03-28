var handler = require('./handler');

function Connection(socket) {
    var _  = new handler.Run(socket);
}

module.exports = Connection;
