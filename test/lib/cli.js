var chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    expect = chai.expect,
    rewire = require('rewire'),
    fakeDocker = rewire('../../lib/docker'),
    cli = rewire('../../lib/cli');

chai.use(sinonChai);

var getSuccessClient = sinon.stub().returns({ ping: function() {} }),
    getFailureClient = sinon.stub().returns({ ping: function(callback) {
        callback(new Error());
    }});


describe('CLI', function() {
    beforeEach(function() {
        fakeExit = sinon.stub();
        fakeConsole = { error: sinon.stub() };
        fakeDocker.__set__('getClient', getSuccessClient);
        revertDocker = cli.__set__('docker', fakeDocker);
        revertConsole = cli.__set__('console', fakeConsole);
    });

    afterEach(function() {
        revertDocker();
        revertConsole();
    });

    context('when called with default arguments', function() {
        var endpointHTTP = 'http://127.0.0.1:2375';

        beforeEach(function() {
            cli.argv(['node', 'server', '-e', endpointHTTP]);
        });

        expectNewDockerClientWith(endpointHTTP, '/home/.docker', 'grounds');
        expectServerToListenOn(8080);
    });

    context('when called with custom arguments', function() {
       var  endpointHTTP = 'http://127.0.0.1:2376',
            certPath = '/test',
            repository = 'test',
            port = 8081;

        beforeEach(function() {
            cli.argv(['node', 'server', '-e', endpointHTTP,
                                        '--certs='+certPath,
                                        '--repository='+repository,
                                        '--port='+port]);
        });
        // This test must use an http endpoint, otherwise it will search
        // for ssl certificates and fail.
        expectNewDockerClientWith(endpointHTTP, certPath, repository);
        expectServerToListenOn(port);
    });

    context('when failed to create a docker client', function() {
        beforeEach(function() {
            cli.argv(['node', 'server', '-e', 'unkown'], fakeExit);
        });

        it('logs an error', function() {
            expect(fakeConsole.error).to.have.been.called;
        });

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

        });
    }

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

    // This tests seems to be redundant with docker module tests

/*    context('when called with wrong docker endpoint', function() {*/
        //beforeEach(function() {
            //var invalidEndpoint = endpointHTTP.replace('http', 'ftp');

            //cli.argv(['node', 'server', '-e', invalidEndpoint], fakeExit);
        //});
        //expectToLogError(fakeDocker.ErrorInvalidEndpoint);
        //expectProgramToFail();
    //});

    //context('when called with invalid docker repository', function() {
        //beforeEach(function() {
            //cli.argv(['node', 'server', '-e', endpointHTTP,
                                        //'--repository=/'], fakeExit);
        //});
        //expectToLogError(fakeDocker.ErrorInvalidRepository);
        //expectProgramToFail();
    //});

    //context('when called with https docker api', function() {
        //var endpointHTTPS = endpointHTTP.replace('http', 'https');

        //context('with wrong certs path', function() {
            //beforeEach(function() {
                //cli.argv(['node', 'server', '-e', endpointHTTPS,
                                            //'--certs=azerty'], fakeExit);
            //});
            //expectToLogError(fakeDocker.ErrorInvalidCertsPath);
            //expectProgramToFail();
        //});

        //context('without ssl certificates', function() {
            //beforeEach(function() {
                //cli.argv(['node', 'server', '-e', endpointHTTPS,
                                            //'--certs=./test'], fakeExit);
            //});
            //expectToLogError(fakeDocker.ErrorMissingKeyCertificate);
            //expectProgramToFail();
        //});
    //});

    //context('when docker API is not responding', function() {
        //beforeEach(function() {
            //fakeDocker.__set__('getClient', getFailureClient);

            //cli.argv(['node', 'server', '-e', endpointHTTP], fakeExit);
        //});
        //expectToLogError(fakeDocker.ErrorAPINotResponding);
        //expectProgramToFail();
    /*});*/
});
