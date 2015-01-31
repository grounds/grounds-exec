var chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    expect = chai.expect,
    rewire = require('rewire'),
    path = require('path'),
    docker = rewire('../../lib/docker');

chai.use(sinonChai);

var endpointHTTP  = 'http://127.0.0.1:2376',
    endpointHTTPS = endpointHTTP.replace('http', 'https'),
    repository    = 'grounds';

var pingSuccess = { ping: function(callback) {
        callback(null);
    }},
    pingFailure = { ping: function(callback) {
        callback(new Error());
    }};

describe('Docker', function() {
    describe('.validate', function() {
        beforeEach(function() {
            callback = sinon.stub();
        });

        context('when endpoint is invalid', function() {
             beforeEach(function() {
                args = { endpoint: 'azerty' };
            });
            expectCallbackWithError(docker.ErrorInvalidEndpoint);
        });

        context('when endpoint is not http or https', function() {
            beforeEach(function() {
                args = { endpoint: endpointHTTP.replace('http', 'ftp') };
            });
            expectCallbackWithError(docker.ErrorInvalidEndpoint);
        });

        context('when docker repository is invalid', function() {
            beforeEach(function() {
                args = { endpoint: endpointHTTP, repository: '/azerty' };
            });
            expectCallbackWithError(docker.ErrorInvalidRepository);
        });

        context('with valid https endpoint', function() {
            beforeEach(function() {
                args = { endpoint: endpointHTTPS, repository: repository };
            });

            context('when docker certificates path is invalid', function() {
                beforeEach(function() {
                    args.certs = 'azerty';
                });
                expectCallbackWithError(docker.ErrorInvalidCertsPath);
            });

            context('when docker certificates path is valid', function() {
                beforeEach(function() {
                    args.certs = '/home/.docker';
                });

                afterEach(function() {
                    revert();
                });

                context('when key.pem is missing', function() {
                    beforeEach(function() {
                        invalidateCertFile('key.pem');
                    });
                    expectCallbackWithError(docker.ErrorMissingKeyCertificate);
                });

                context('when cert.pem is missing', function() {
                    beforeEach(function() {
                        invalidateCertFile('cert.pem');
                    });
                    expectCallbackWithError(docker.ErrorMissingCertCertificate);
                });

                context('when ca.pem is missing', function() {
                    beforeEach(function() {
                        invalidateCertFile('ca.pem');
                    });
                    expectCallbackWithError(docker.ErrorMissingCaCertificate);
                });

                // Stub fs to validate presence of all files except
                // file specified.
                function invalidateCertFile(certFile) {
                    revert = docker.__set__('fs', { existsSync: function(file) {
                        if (file === path.resolve(args.certs, certFile))
                          return false;
                        else
                          return true;
                    }});
                }
            });
        });

        context('with everything valid', function() {
            beforeEach(function() {
                args = { endpoint: endpointHTTP, repository: repository };
            });

            afterEach(function() {
                stub.restore();
            });

            context('when docker API is responding', function() {
                beforeEach(function() {
                    stub = sinon.stub(docker, 'getClient').returns(pingSuccess);
                });

                it('call callback with a proper docker client', function(done) {
                    docker.validate(args, function(err, client) {
                        expect(client).not.to.be.null;
                        done();
                    });
                });

                it('call callback without an error', function(done) {
                    docker.validate(args, function(err, client) {
                        expect(err).to.be.null;
                        done();
                    });
                });
            });

            context('when docker API is not responding', function() {
                beforeEach(function() {
                   stub = sinon.stub(docker, 'getClient').returns(pingFailure);
                });
                expectCallbackWithError(docker.ErrorAPINotResponding);
            });
        });

        function expectCallbackWithError(error) {
            it('call callback with: '+error, function() {
                docker.validate(args, callback);
                expect(callback).to.have.been.calledWithExactly(error);
            });
        }
    });

    describe('.getClient', function() {
        it('returns a docker client with repository '+repository, function() {
            var client = docker.getClient(endpointHTTP, null, repository);

            expect(client.repository).to.eq(repository);
        });
    });
});
