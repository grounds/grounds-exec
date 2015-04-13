var rewire  = require('rewire'),
    sinon = require('sinon'),
    expect = require('chai').expect,
    example = require('../support/example'),
    utils = require('../../lib/utils'),
    docker = require('../../lib/docker'),
    Runner = rewire('../../lib/runner');

var MAX_MEMORY         = Runner.__get__('MAX_MEMORY'),
    MAX_EXECUTION_TIME = Runner.__get__('MAX_EXECUTION_TIME');

describe('Runner', function() {
    var sleepCode   = new example.Sleep(),
        defaultCode = new example.Default();

    it('has a max execution time of 10 seconds', function() {
        expect(MAX_EXECUTION_TIME / 1000).to.equal(10);
    });

    describe('#run()', function() {
        context('when container creation succeed', function(done) {
            var runner = new Runner(),
                containerCreate;

            before(function(done) {
                // First we need to manually setup a container.
                return runner._createContainer(defaultCode)
                .then(function(container) {
                    // We stub our container attach to fail.
                    container.attach = sinon.stub().yields(new Error());

                    // We stub our runner client to yield this container.
                    runner.client.createContainer = sinon.stub().yields(null, container);

                    return runner.run(defaultCode);
                })
                .then(function() {
                    done('Run should fail after container creation.');
                })
                .fail(function() {
                    done();
                });
            });

            it('has a container', function() {
                expect(runner.container).to.exist;
            });

            it('creates a container with maxMemory set', function(done) {
                return runner._getContainer('Memory')
                .then(function(info) {
                    expect(info).to.equal(MAX_MEMORY);
                    done();
                });
            });

            it('creates a container with this language image', function(done) {
                var dockerClient = docker.getClient();

                var image = utils.formatImage(
                    dockerClient.repository,
                    defaultCode.language,
                    dockerClient.tag
                );

                return runner._getContainer('Image')
                .then(function(info) {
                    expect(info).to.equal(image);
                    done();
                });
            });

            it('creates a container with this code command', function(done) {
                var cmd = utils.formatCmd(defaultCode.code);

                return runner._getContainer('Cmd')
                .then(function(info) {
                    expect(info).to.deep.equal([cmd]);
                    done();
                });
            });
        });

        context('when container creation failed', function(done) {
            var runner = new Runner(),
                error = new Error('Create failed'),
                containerCreate;

            before(function() {
                runner.client.createContainer = sinon.stub().yields(error);
            });

            it('gets an error', function(done) {
                run(runner, defaultCode, function(err) {
                    expect(err).to.equal(error);
                    done();
                });
            });
        });

        ['attach', 'start', 'wait', 'inspect', 'remove'].forEach(
            function (action) {
            context('when docker fail to '+action+' this container', function() {
                var runner = new Runner(),
                    error = new Error(action+' failed.'),
                    containerCreate;

                before(function(done) {
                    // First we need to manually setup a container.
                    return runner._createContainer(defaultCode)
                    .then(function(container) {
                        // We stub our container action to fail.
                        container[action] = sinon.stub().yields(error);

                        runner.client.createContainer = sinon
                          .stub().yields(null, container);

                        done();
                    })
                    .fail(function(err) {
                        done(err);
                    });
                });

                it('gets an error', function(done) {
                    run(runner, defaultCode, function(err) {
                        expect(err).to.equal(error);
                        done();
                    });
                });
            });
        });

        // For this context we are testing against a
        // code sample that writes both on stdout and
        // stderr, returns an exit code of 1, with a
        // really short execution time.
        context('when container exits', function() {
            var runner = new Runner(),
                emited;

            before(function(done) {
                emited = attachEvents(runner);

                run(runner, defaultCode, done);
            });

            it('has emited container exit code', function() {
                expect(emited.exitCode).to.equal(defaultCode.exitCode);
            });

            it('has emited appropriate output on stdout', function() {
                expect(emited.output.stdout).to.equal(defaultCode.stdout);
            });

            it('has emited appropriate output on stderr', function() {
                expect(emited.output.stderr).to.equal(defaultCode.stderr);
            });

            it('has removed its container', function(done) {
                emited.container.inspect(function(err, data) {
                    expect(err).to.exist;
                    done();
                });
            });

            it('has no container', function() {
                expect(runner.container).not.to.exist;
            });
        });

        // For this context we are using a code sample
        // that should hang more than the test suite
        // default timeout, but runner should automatically
        // timeouts after maxExecutionTime and stop the
        // container, preventing these tests from timeouts.
        context('when execution is too long', function() {
            var fakeTimeout = 1, runner, revert;

            before(function() {
                revert = Runner.__set__('MAX_EXECUTION_TIME', fakeTimeout);
                runner = new Runner();
            });

            after(function() {
                revert();
            });

            it('emits a timeout and stops the container', function(done) {
                var timeout;

                runner.on('timeout', function(executionTime) {
                    timeout = executionTime;
                });

                run(runner, sleepCode, function(err) {
                    expect(timeout).to.equal(fakeTimeout);
                    done();
                });
            });
        });
    });

    describe('#stop()', function() {
        context('when idle', function() {
            var  runner = new Runner();

            it('does nothing', function() {
                expect(function() {
                    runner.stop();
                }).not.to.throw(Error);
            });
        });

        // For this context we are using a code example
        // that should hang more than the test suite
        // default timeout, if stop fails, these tests
        // should timeout.
        context('when running', function() {
            var runner = new Runner(),
                emited;

            beforeEach(function(done) {
                runner.on('start', function() {
                    runner.stop();
                });

                emited = attachEvents(runner);

                run(runner, sleepCode, done);
            });

            // We must verify that the container doesn't
            // stop because of the code sent as parameter.
            it('stops the container execution', function() {
                expect(emited.output.stderr).to.equal('');
            });

            it("hasn't emited container exit code", function() {
                expect(emited.exitCode).not.to.exist;
            });
        });
    });

    function attachEvents(runner) {
        var emited = {
            output: { stdout: '', stderr: '' },
        }

        runner.on('output', function(data) {
            emited.output[data.stream] += data.chunk;
        }).on('status', function(data) {
            emited.exitCode = data;
        }).on('timeout', function(data){
            emited.timeout = data;
        }).on('created', function(data){
            emited.container = data;
        });
        return emited;
    }

    function run(runner, example, cb) {
        return runner.run(example)
        .then(function() {
            cb();
        })
        .fail(function(err) {
            cb(err);
        });
    }
});
