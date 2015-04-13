var rewire = require('rewire'),
    sinon = require('sinon'),
    quietHandlers = require('./handlers'),
    server = rewire('../../lib/server');

var quietLogger = { log: sinon.stub(), error: sinon.stub() };

server.__set__({
    handlers: quietHandlers,
    logger:   quietLogger,
});

function Server() {
    this.port = 8080;
    this.URL  = 'http://127.0.0.1:8080',
    this.options = { transports: ['websocket'], 'forceNew': true };
}

Server.prototype.listen = function() {
    server.listen(this.port);
}

Server.prototype.close = function() {
    server.close();
}

module.exports = Server;
