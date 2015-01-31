var rewire = require('rewire'),
    sinon = require('sinon'),
    expect = require('chai').expect,
    io = require('socket.io-client'),
    docker = require('../spec_helper').docker,
    server = rewire('../../lib/server');

var socket = {
    port: 8080,
    URL: 'http://127.0.0.1:8080',
    options: { transports: ['websocket'], 'force new connection': true }
}

describe('Server', function() {
    beforeEach(function(){
        fakeLogger = { log: sinon.stub(), error: sinon.stub() };
        revert = server.__set__('logger', fakeLogger);
    });

    afterEach(function(){
        revert();
    });

    describe('.listen', function() {
        context('when port number is invalid', function() {
            var port = -1;

            it('fails to listen', function() {
                server.listen(port, docker);
            });
        });

        context('when port is already bind', function() {

        });

        context('when listening', function() {
            beforeEach(function(){
                server.listen(socket.port, docker);
            });

            it('logs a message', function() {
                expect(fakeLogger).to.have.been.called;
            });

            context('when a new client connects', function() {
                beforeEach(function(){
                    client = io.connect(socket.URL, socket.options);
                });

                afterEach(function(){
                    client.disconnect();
                });
            });
        });
    });
});
