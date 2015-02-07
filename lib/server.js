var validator = require('validator'),
    io = require('socket.io'),
    newrelic = require('newrelic'),
    logger = require('./logger'),
    errors = require('./errors'),
    Connection = require('./connection');

module.exports.listen = function(port, docker) {
    if (!validator.isNumeric(port) || port <= 0) {
        return errors.ServerPortInvalid;
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
