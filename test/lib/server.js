var rewire = require('rewire'),
    sinon = require('sinon'),
    chai = require('chai'),
    sinonChai = require('sinon-chai'),
    expect = chai.expect,
    io = require('socket.io-client'),
    docker = require('../spec_helper').docker,
    server = rewire('../../lib/server');

chai.use(sinonChai);

var error = server.__get__('error');

describe('Server', function() {
    beforeEach(function(){
        fakeLogger = { log: sinon.stub(), error: sinon.stub() };
        revertLogger = server.__set__('logger', fakeLogger);

        port = 8080;
        URL  = 'http://127.0.0.1:8080';
    });

    afterEach(function(){
        revertLogger();
    });

    describe('.listen', function() {
        context('when port is not numeric', function() {
            beforeEach(function(){
                err = server.listen('lol', docker);
            });

            it('returns error: '+error.InvalidPort, function() {
                expect(err).to.equal(error.InvalidPort);
            });
        });

        context('when port is numeric', function() {
            beforeEach(function(){
                server.listen(port, docker);
            });

            afterEach(function(){
                server.close();
            });

            it('logs listening message', function() {
               expect(fakeLogger.log).to.have.been
                .calledWith('Listening on:', port);
            });

            it('accepts new connection and disconnection', function(done) {
                var client = io.connect(URL);

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
                server.listen(port, docker);
            });

            it('closes the server', function() {
                server.close();
            });
        });
    });
});
