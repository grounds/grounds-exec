var rewire  = require('rewire'),
    sinon = require('sinon'),
    expect = require('chai').expect,
    docker = rewire('../../lib/docker');

var DEFAULT_REPOSITORY = docker.__get__('DEFAULT_REPOSITORY');

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
            beforeEach(function() {
                repository = 'test';

                setRepositoryTo(repository);

                client = docker.getClient();
            });

            afterEach(function() {
                revertRepository();
            });

            it('returns a docker client with env repository', function() {
                expect(client.repository).to.equal(repository);
            });
        });

        context('when repository is not present in environment', function() {
            beforeEach(function() {
                setRepositoryTo('');

                client = docker.getClient();
            });

            afterEach(function() {
                revertRepository();
            });

            it('returns a docker client with default repository', function() {
                expect(client.repository).to.equal(DEFAULT_REPOSITORY);
            });
        });

        function setRepositoryTo(repository) {
            envRepository = process.env.REPOSITORY;

            process.env.REPOSITORY = repository;
        }

        function revertRepository() {
            process.env.REPOSITORY = envRepository;
        }
    });
});
