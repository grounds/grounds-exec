var rewire = require('rewire'),
    sinon = require('sinon'),
    chai = require('chai'),
    sinonChai = require('sinon-chai'),
    expect = chai.expect,
    io = require('socket.io-client'),
    docker = require('../spec_helper').docker,
    socket = require('../spec_helper').socket,
    errors = require('../../lib/errors'),
    server = rewire('../../lib/server');

chai.use(sinonChai);

describe('Server', function() {
    beforeEach(function(){
        fakeLogger = { log: sinon.stub(), error: sinon.stub() };
        revertLogger = server.__set__('logger', fakeLogger);
    });

    afterEach(function(){
        revertLogger();
    });

    describe('.listen', function() {
        context('when port is not numeric', function() {
            beforeEach(function(){
                err = server.listen('lol', docker);
            });

            it('returns error: '+errors.ServerPortInvalid, function() {
                expect(err).to.equal(errors.ServerPortInvalid);
            });
        });

        context('when port is numeric', function() {
            beforeEach(function(){
                server.listen(socket.port, docker);
            });

            afterEach(function(){
                server.close();
            });

            it('logs listening message', function() {
               expect(fakeLogger.log).to.have.been
                .calledWith('Listening on:', socket.port);
            });

            it('accepts new connection and disconnection', function(done) {
                var client = io.connect(socket.URL);

                client.on('connect', function() {
                    client.disconnect();
                    done();
                });
            });
        });
    });

    describe('.close', function() {
        context('when server is running', function() {
            beforeEach(function(){
                server.listen(socket.port, docker);
            });

            it('closes the server', function() {
                server.close();
            });
        });
    });
});
