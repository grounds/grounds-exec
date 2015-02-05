var chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    expect = chai.expect,
    rewire = require('rewire'),
    path = require('path'),
    errors = require('../../lib/errors'),
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
            expectCallbackWithError(errors.DockerAPIInvalidEndpoint);
        });

        context('when endpoint is not http or https', function() {
            beforeEach(function() {
                args = { endpoint: endpointHTTP.replace('http', 'ftp') };
            });
            expectCallbackWithError(errors.DockerAPIInvalidEndpoint);
        });

        context('when docker repository is invalid', function() {
            beforeEach(function() {
                args = { endpoint: endpointHTTP, repository: '/azerty' };
            });
            expectCallbackWithError(errors.DockerAPIInvalidRepository);
        });

        context('with valid https endpoint', function() {
            beforeEach(function() {
                args = { endpoint: endpointHTTPS, repository: repository };
            });

            context('when docker certificates path is invalid', function() {
                beforeEach(function() {
                    args.certs = 'azerty';
                });
                expectCallbackWithError(errors.DockerAPIInvalidCertsPath);
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
                    expectCallbackWithError(errors.DockerAPIInvalidCertsPath);
                });

                context('when cert.pem is missing', function() {
                    beforeEach(function() {
                        invalidateCertFile('cert.pem');
                    });
                    expectCallbackWithError(errors.DockerAPIMissingKeyCertificate);
                });

                context('when ca.pem is missing', function() {
                    beforeEach(function() {
                        invalidateCertFile('ca.pem');
                    });
                    expectCallbackWithError(errors.DockerAPIMissingCertCertificate);
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
                revert();
            });

            context('when docker API is responding', function() {
                beforeEach(function() {
                    revert = docker.__set__('getClient', sinon.stub().returns(pingSuccess));
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
                    revert = docker.__set__('getClient', sinon.stub().returns(pingFailure));
                });
                expectCallbackWithError(errors.DockerAPINotResponding);
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
        contextWithRepository('grounds');
        contextWithRepository('test');

        // Test the same configuration used in spec helper to test modules
        // wich required a valid docker client.
        context('with specs config', function() {
            beforeEach(function() {
                var endpoint = process.env.DOCKER_URL,
                    certs = process.env.DOCKER_CERT_PATH || '/home/.docker',
                    repository = process.env.REPOSITORY || 'grounds';

                dockerClient = docker.getClient(endpoint, certs, repository);
            });

            it('returns a proper docker client to connect with', function(done) {
                dockerClient.ping(function(err) {
                    expect(err).to.be.null;
                    done();
                });
            });
        });

        function contextWithRepository(repository) {
            context('with repository '+repository, function() {
                beforeEach(function() {
                    dockerClient = docker.getClient(endpointHTTP, null, repository);
                });

                it('returns a docker client using repository '+repository, function() {
                    expect(dockerClient.repository).to.eq(repository);
                });
            });
        }
    });
});
