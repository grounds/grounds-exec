var rewire  = require('rewire'),
    sinon = require('sinon'),
    expect = require('chai').expect,
    docker = rewire('../../lib/docker');

var DEFAULT_REPOSITORY = docker.__get__('DEFAULT_REPOSITORY'),
    DEFAULT_TAG        = docker.__get__('DEFAULT_TAG');

describe('Docker', function() {

    describe('.getClient', function() {

        // This test ensure we can speak with the Docker host
        // set in the environment. If another test fails to speak
        // with the targeted Docker host, run this test suite first.
        it('returns a valid docker client', function(done) {
            var client = docker.getClient();

            client.ping(function(err) {
                done(err);
            });
        });

        context('when repository is present in environment', function() {
            var repository = 'test', env;

            setEnv('REPOSITORY', repository);

            var client = docker.getClient();

            revertEnv();

            it('returns a docker client using env repository', function() {
                expect(client.repository).to.equal(repository);
            });
        });

        context('when repository is not present in environment', function() {
            var env;

            setEnv('REPOSITORY', '');

            var client = docker.getClient();

            revertEnv();

            it('returns a docker client using default repository', function() {
                expect(client.repository).to.equal(DEFAULT_REPOSITORY);
            });
        });

        context('when tag is present in environment', function() {
            var tag = '1.0.0', env;

            setEnv('TAG', tag);

            var client = docker.getClient();
            
            revertEnv();

            it('returns a docker client using env tag', function() {
                expect(client.tag).to.equal(tag);
            });
        });

        context('when tag is not present in environment', function() {
            var env;

            setEnv('TAG', '');

            var client = docker.getClient();

            revertEnv();

            it('returns a docker client using default tag', function() {
                expect(client.tag).to.equal(DEFAULT_TAG);
            });
        });

        function setEnv(key, value) {
            env = process.env;

            process.env[key] = value;
        }

        function revertEnv() {
            process.env = env;
        }
    });
});
