var validator = require('validator'),
    io = require('socket.io'),
    logger = require('./logger'),
    Connection = require('./connection');

var error = {
    InvalidPort: new Error('Invalid port.')
}

module.exports.listen = function(port, docker) {
    if (!validator.isNumeric(port) || port <= 0) {
        return error.InvalidPort;
    }

    server = io.listen(port);

    logger.log('Listening on:', port);

    server.on('connection', function(socket) {
        logger.log('New connection.');

        new Connection(socket, docker);

    }).on('disconnect', function () {
        logger.log('A client has disconnected.');
    });
}

module.exports.close = function() {
    server.close();
}
