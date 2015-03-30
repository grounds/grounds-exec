var rewire = require('rewire'),
    sinon = require('sinon'),
    chai = require('chai'),
    sinonChai = require('sinon-chai'),
    expect = chai.expect,
    io = require('socket.io-client'),
    server = rewire('../../lib/server');

chai.use(sinonChai);

describe('Server', function() {
    beforeEach(function(){
        quietLogger = { log: sinon.stub(), error: sinon.stub() };
        revertLogger = server.__set__('logger', quietLogger);

        port = 8080;
        url  = 'http://127.0.0.1:8080';
    });

    afterEach(function(){
        revertLogger();
    });

    describe('.listen', function() {
        beforeEach(function(){
            server.listen(port);
        });

        afterEach(function(){
            server.close();
        });

        it('logs listening message', function() {
           expect(fakeLogger.log).to.have.been
            .calledWith('Listening on:', port);
        });

        it('accepts new connection and disconnection', function(done) {
            var client = io.connect(url);

            client.on('connect', function() {
                client.disconnect();
                done();
            });
        });
    });

    describe('.close', function() {
        context('when server is running', function() {
            beforeEach(function(){
                server.listen(port);
            });

            it('closes the server', function() {
                server.close();
            });
        });

        context('when server is not running', function() {
            it('closes the server', function() {
                expect(function() {
                    server.close();
                }).to.throw(Error);
            });
        });
    });
});
