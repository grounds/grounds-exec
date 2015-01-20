var chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    expect = chai.expect,
    rewire = require('rewire'),
    cli = rewire('../../lib/cli');

chai.use(sinonChai);

describe('CLI', function() {
    beforeEach(function() {
        docker = { getClient: sinon.stub() };
        cli.__set__({ docker: docker });
    });

    context('when called with default arguments', function() {
        var endpoint = 'http://127.0.0.1:2375';

        it('creates a docker client', function() {
            cli.argv(['node', 'server', '-e', endpoint]);

            expect(docker.getClient).to.have.been
                .calledWith(endpoint, '/home/.docker', 'grounds');
        });
    });

    context('when called with custom arguments', function() {
        var endpoint = 'http://127.0.0.1:2376',
            certs = '/test',
            repo = 'test';

        it('creates a docker client', function() {
            cli.argv(['node', 'server', '-e', endpoint,
                                        '--certs='+certs,
                                        '--repository='+repo]);

            expect(docker.getClient).to.have.been
                .calledWith(endpoint, certs, repo);
        });
    });

    context('when called with wrong docker endpoint', function() {

    });

    context('when called with wrong port number', function() {

    });

    describe('version', function() {
        it('prints version from package.json', function() {
            var expected = require('../../package.json').version;

     //       cli.argv(['node', 'server', 'version']);
        });
    });
});
