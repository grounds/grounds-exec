var validator = require('validator'),
    io = require('socket.io'),
    logger = require('./logger'),
    handlers = require('./handlers');

module.exports.listen = function(port) {
    server = io.listen(port);

    logger.log('Listening on:', port);

    server.on('connection', function(socket) {
        logger.log('New connection.');

        handlers.bind(socket);

    }).on('disconnect', function () {
        logger.log('A client has disconnected.');
    });
}

module.exports.close = function() {
    server.close();
}
