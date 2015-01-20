var logger = require('./logger'),
    Connection = require('./connection');

module.exports.listen = function(port, docker) {
    logger.log('Listening on:', port);

    var io = require('socket.io').listen(port);

    io.on('connection', function (socket) {
        logger.log('New connection.');
        new Connection(socket, docker).bindEvents();
    }).on('disconnect', function() {
        logger.log('A client has disconnected.');
    });
}