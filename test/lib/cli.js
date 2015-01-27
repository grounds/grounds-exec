var chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    expect = chai.expect,
    rewire = require('rewire'),
    fakeDocker = require('../../lib/docker'),
    cli = rewire('../../lib/cli');

chai.use(sinonChai);

var endpointHTTP = 'http://127.0.0.1:2376',
    certPath = '/test',
    repository = 'test';

var pingSuccess = { ping: function() {} },
    pingFailure = { ping: function(callback) {
        callback(new Error());
    }};

describe('CLI', function() {
    beforeEach(function() {
        fakeExit = sinon.stub();
        fakeDocker.getClient = sinon.stub().returns(pingSuccess);
        fakeConsole = { error: sinon.stub() };
        revertDocker = cli.__set__('docker', fakeDocker);
        revertConsole = cli.__set__('console', fakeConsole);
    });

    afterEach(function() {
        revertDocker();
        revertConsole();
    });

    context('when called with default arguments', function() {
        beforeEach(function() {
            cli.argv(['node', 'server', '-e', endpointHTTP]);
        });

        expectNewDockerClientWith(endpointHTTP, '/home/.docker', 'grounds');
    });

    context('when called with custom arguments', function() {
        beforeEach(function() {
            cli.argv(['node', 'server', '-e', endpointHTTP,
                                        '--certs='+certPath,
                                        '--repository='+repository]);
        });
        // This test must use an http endpoint, otherwise it will search
        // for ssl certificates and fail.
        expectNewDockerClientWith(endpointHTTP, certPath, repository);
    });

    function expectNewDockerClientWith(endpoint, certs, repo) {
        var title = 'creates a docker client with endpoint: '+
                endpoint+', cert path: '+certs+', repository: '+repo;

        it(title, function() {
            expect(fakeDocker.getClient).to.have.been
                .calledWith(endpoint, certs, repo);
        });
    }

    context('when called with wrong docker endpoint', function() {
        beforeEach(function() {
            var invalidEndpoint = endpointHTTP.replace('http', 'ftp');

            cli.argv(['node', 'server', '-e', invalidEndpoint], fakeExit);
        });
        expectProgramToFail();
        expectToLogError(fakeDocker.invalidDockerEndpoint);
    });

    context('when called with invalid docker repository', function() {
        beforeEach(function() {
            cli.argv(['node', 'server', '-e', endpointHTTP,
                                        '--repository=/'], fakeExit);
        });
        expectProgramToFail();
        expectToLogError(fakeDocker.invalidDockerRepository);
    });

    context('when called with https docker api', function() {
        var endpointHTTPS = endpointHTTP.replace('http', 'https');

        context('with wrong certs path', function() {
            beforeEach(function() {
                cli.argv(['node', 'server', '-e', endpointHTTPS,
                                            '--certs=azerty'], fakeExit);
            });
            expectProgramToFail();
            expectToLogError(fakeDocker.invalidDockerCertsPath);
        });

        context('without ssl certificates', function() {
            beforeEach(function() {
                cli.argv(['node', 'server', '-e', endpointHTTPS,
                                            '--certs=./test'], fakeExit);
            });
            expectProgramToFail();
            expectToLogError(fakeDocker.missingKeyCertificate);
        });
    });

    context('when docker API is not responding', function() {
        beforeEach(function() {
            revertDocker();
            fakeDocker.getClient = sinon.stub().returns(pingFailure);
            revertDocker = cli.__set__('docker', fakeDocker);

            cli.argv(['node', 'server', '-e', endpointHTTP], fakeExit);
        });

        expectProgramToFail();
        expectToLogError(new Error('Docker API not responding.'));
    });

    context('when called with wrong port number', function() {
    });

    function expectProgramToFail() {
        it('exit the program with status code 1', function() {
            expect(fakeExit).to.have.been.calledWith(1);
        });
    }

    function expectToLogError(error) {
        it('logs error: '+error.message, function() {
            expect(fakeConsole.error).to.have.been.calledWith(error.message);
        });
    }
});
