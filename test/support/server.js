var rewire = require('rewire'),
    sinon = require('sinon'),
    expect = require('chai').expect,
    io = require('socket.io-client'),
    server = rewire('../../lib/server'),
    Connection = rewire('../../lib/connection'),
    handler = rewire('../../lib/handler'),
    runHandler = rewire('../../lib/handler/run');

function Server() {
    this.port = 8080;
    this.URL  = 'http://127.0.0.1:8080',
    this.options = { transports: ['websocket'], 'forceNew': true };
}

Server.prototype.listen = function() {
    var logger = { log: sinon.stub(), error: sinon.stub() };

//    handler.__set__('Run', runHandler);
    Connection.__set__('handler', handler);
    server.__set__('Connection', Connection);
    server.__set__('logger', logger);

    server.listen(this.port);
}

Server.prototype.close = function() {
    server.close();
}

module.exports = Server;
