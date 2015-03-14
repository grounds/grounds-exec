var chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    expect = chai.expect,
    rewire = require('rewire'),
    fakeDocker = rewire('../../lib/docker'),
    cli = rewire('../../lib/cli');

chai.use(sinonChai);

var successClient = { ping: sinon.stub().yields(null) },
    getSuccessClient = sinon.stub().returns(successClient);

var endpointHTTP = 'http://127.0.0.1:2375';

describe('CLI', function() {
    beforeEach(function() {
        fakeExit = sinon.stub();
        fakeConsole = { error: sinon.stub() };
        fakeServer = { listen: sinon.stub() };
        fakeDocker.__set__('getClient', getSuccessClient);
        revertDocker = cli.__set__('docker', fakeDocker);
        revertConsole = cli.__set__('console', fakeConsole);
        revertServer = cli.__set__('server', fakeServer);
    });

    afterEach(function() {
        revertDocker();
        revertConsole();
        revertServer();
    });

    context('when called with default arguments', function() {
        beforeEach(function() {
            cli.argv(['node', 'server', '-e', endpointHTTP]);
        });

        expectNewDockerClientWith(endpointHTTP, '/home/.docker', 'grounds');
        expectServerToListenOn(8080);
    });

    context('when called with custom valid arguments', function() {
       var  endpointHTTP = 'http://127.0.0.1:2376',
            certsPath = '/test',
            repository = 'test',
            invalidPort = 'invalid';

        beforeEach(function() {
            cli.argv(['node', 'server', '-e', endpointHTTP,
                                        '--certs='+certsPath,
                                        '--repository='+repository,
                                        '--port='+invalidPort]);
        });
        // This test must use an http endpoint, otherwise it will search
        // for ssl certificates and fail.
        expectNewDockerClientWith(endpointHTTP, certsPath, repository);

    });

    context('when failed to create a docker client', function() {
        beforeEach(function() {
            cli.argv(['node', 'server', '-e', 'unknown'], fakeExit);
        });
        expectToLogError();
        expectProgramToFail();
    });

    context('when called with invalid port', function() {
        beforeEach(function() {
            revertServer();

            cli.argv(['node', 'server', '-e', endpointHTTP,
                                        '-p', 'lol'],
                                        fakeExit);
        });
        expectToLogError();
        expectProgramToFail();
    });

    function expectNewDockerClientWith(endpoint, certs, repo) {
        var title = 'creates a docker client with endpoint: '+
                endpoint+', cert path: '+certs+', repository: '+repo;

        it(title, function() {
            expect(getSuccessClient).to.have.been
                .calledWith(endpoint, certs, repo);
        });
    }

    function expectServerToListenOn(port) {
        it('launches a server listening on '+port, function() {
            expect(fakeServer.listen).to.have.been
                .calledWith(port, successClient);
        });
    }

    function expectProgramToFail() {
        it('exit the program with status code 1', function() {
            expect(fakeExit).to.have.been.calledWith(1);
        });
    }

    function expectToLogError() {
        it('logs an error', function() {
            expect(fakeConsole.error).to.have.been.called;
        });
    }
});
