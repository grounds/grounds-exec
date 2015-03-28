var chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    expect = chai.expect,
    rewire = require('rewire'),
    cli = rewire('../../lib/cli');

chai.use(sinonChai);

var error = cli.__get__('error');

describe('CLI', function() {
    beforeEach(function() {
        fakeExit = sinon.stub();
        fakeConsole = { error: sinon.stub() };
        fakeServer = { listen: sinon.stub() };
        revertConsole = cli.__set__('console', fakeConsole);
        revertServer = cli.__set__('server', fakeServer);
    });

    afterEach(function() {
        revertConsole();
        revertServer();
    });

    context('when called with default arguments', function() {
        beforeEach(function() {
            cli.argv(['node', 'server']);
        });

        expectServerToListenOn(8080);
    });

    context('when called with custom port', function() {
        beforeEach(function() {
            cli.argv(['node', 'server', '-p', 8081]);
        });

        expectServerToListenOn(8081);
    });

    context('when called with invalid port', function() {
        beforeEach(function() {
            revertServer();

            cli.argv(['node', 'server', '-p', 'lol'], fakeExit);
        });
        expectToLogError(error.InvalidPort);
        expectProgramToFail();
    });

    function expectServerToListenOn(port) {
        it('launches a server listening on '+port, function() {
            expect(fakeServer.listen).to.have.been
                .calledWith(port);
        });
    }

    function expectProgramToFail() {
        it('exits the program with status code 1', function() {
            expect(fakeExit).to.have.been.calledWith(1);
        });
    }

    function expectToLogError(error) {
        it('logs error: '+error, function() {
            expect(fakeConsole.error).to.have.been.calledWith(error);
        });
    }
});
