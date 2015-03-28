var validator = require('validator'),
    io = require('socket.io'),
    logger = require('./logger'),
    Connection = require('./connection');

module.exports.listen = function(port) {
    server = io.listen(port);

    logger.log('Listening on:', port);

    server.on('connection', function(socket) {
        logger.log('New connection.');

        var _ = new Connection(socket);

    }).on('disconnect', function () {
        logger.log('A client has disconnected.');
    });
}

module.exports.close = function() {
    server.close();
}
