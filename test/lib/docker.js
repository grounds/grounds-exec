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

describe('Docker', function() {
    describe('.validate', function() {
        beforeEach(function() {
            callback = sinon.stub();
        });

        context('when endpoint is invalid', function() {
             beforeEach(function() {
                args = { endpoint: 'azerty' };
            });
            expectCallbackWithError(docker.invalidDockerEndpoint);
        });

        context('when endpoint is not http or https', function() {
            beforeEach(function() {
                args = { endpoint: 'ftp://127.0.0.1:2376' };
            });
            expectCallbackWithError(docker.invalidDockerEndpoint);
        });

        context('when docker repository is invalid', function() {
            beforeEach(function() {
                args = { endpoint: endpointHTTP, repository: '/azerty' };
            });
            expectCallbackWithError(docker.invalidDockerRepository);
        });

        context('with valid https endpoint', function() {
            beforeEach(function() {
                args = { endpoint: endpointHTTPS, repository: 'grounds' };
            });

            context('when docker certificates path is invalid', function() {
                beforeEach(function() {
                    args.certs = 'azerty';
                });
                expectCallbackWithError(docker.invalidDockerCertsPath);
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
                    expectCallbackWithError(docker.missingKeyCertificate);
                });

                context('when cert.pem is missing', function() {
                    beforeEach(function() {
                        invalidateCertFile('cert.pem');
                    });
                    expectCallbackWithError(docker.missingCertCertificate);
                });

                context('when ca.pem is missing', function() {
                    beforeEach(function() {
                        invalidateCertFile('ca.pem');
                    });
                    expectCallbackWithError(docker.missingCaCertificate);
                });

                // Stub fs to validate existence of all files except
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
                docker.getClient = sinon.stub().returns(true);
            });
            // expect callback with client == true
        });

        function expectCallbackWithError(error) {
            it('call callback with: '+error, function() {
                docker.validate(args, callback);
                expect(callback).to.have.been.calledWithExactly(null, error);
            });
        }
    });
});
