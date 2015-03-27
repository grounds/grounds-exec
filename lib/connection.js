var handler = require('./handler');

function Connection(socket, docker) {
    var _  = new handler.Run(socket, docker);
}

module.exports = Connection;
