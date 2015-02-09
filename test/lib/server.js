var rewire = require('rewire'),
    sinon = require('sinon'),
    chai = require('chai'),
    sinonChai = require('sinon-chai'),
    expect = chai.expect,
    io = require('socket.io-client'),
    docker = require('../spec_helper').docker,
    errors = require('../../lib/errors'),
    server = rewire('../../lib/server');

chai.use(sinonChai);

var socket = {
    port: 8080,
    URL: 'http://127.0.0.1:8080',
    options: { transports: ['websocket'], 'forceNew': true }
}

describe('Server', function() {
    beforeEach(function(){
        fakeLogger = { log: sinon.stub(), error: sinon.stub() };
        fakeConnection = sinon.spy();
        revertLogger = server.__set__('logger', fakeLogger);
        revertConnection = server.__set__('Connection', fakeConnection);
    });

    afterEach(function(){
        revertLogger();
        revertConnection();
    });

    describe('.listen', function() {
        context('when port is not numeric', function() {
            beforeEach(function(){
                err = server.listen('lol', docker);
            });
            expectToReturnError(errors.ServerPortInvalid);
        });

        context('when port number is invalid', function() {
            beforeEach(function(){
                err = server.listen(-1, docker);
            });
            expectToReturnError(errors.ServerPortInvalid);
        });

/*        context('when port is already bind', function() {*/
            //beforeEach(function(){
                //server.listen(socket.port, docker);
                //err = server.listen(socket.port, docker);
            //});
            //expectToReturnError(errors.ServerFailedToListen);
        /*});*/

        function expectToReturnError(error) {
            it('returns error: '+error.message, function() {
                expect(err).to.eq(error);
            });
        }

        context('when listening', function() {
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

            context('when a new client connects', function() {
                beforeEach(function(){
                    client = io.connect(socket.URL, socket.options);
                });

                it('creates a connection', function() {
                    //new fakeConnection();
                    //expect(fakeConnection).to.have.been.calledWithNew();
                });
            });
        });
    });
});
