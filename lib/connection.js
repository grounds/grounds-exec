var handler = require('./handler');

function Connection(socket, docker) {
    new handler.Run(socket, docker);
}

module.exports = Connection;
