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

    beforeEach(function() {
        runner = new Runner();
    });

    describe('#run()', function() {
        context('when container creation succeed', function(done) {
            beforeEach(function(done) {
                // First we need to manually setup a container.
                return runner._createContainer(defaultCode)
                .then(function(container) {
                    // We stub our container attach to fail.
                    container.attach = sinon.stub().yields(new Error());

                    // We stub our runner client to yield this container.
                    setFakeContainerCreate(null, container);

                    return runner.run(defaultCode);
                })
                .then(function() {
                    done('Run should fail after container creation.');
                })
                .fail(function() {
                    done();
                });
            });

            afterEach(function() {
                revertContainerCreate();
            });

            it('has a container', function() {
                expect(runner.container).not.to.be.null;
            });

            it('creates a container with maxMemory set', function(done) {
                return runner._getContainer('Memory')
                .then(function(info) {
                    expect(info).to.equal(MAX_MEMORY);
                    done();
                });
            });

            it('creates a container with this language image', function(done) {
                var dockerClient = docker.getClient()

                var image = utils.formatImage(dockerClient.repository,
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
            beforeEach(function() {
                error = new Error();

                revert = runner.client.createContainer;

                setFakeContainerCreate(error);
            });

            afterEach(function() {
                revertContainerCreate();
            });

            expectError();
        });

        ['attach', 'start', 'wait', 'inspect', 'remove'].forEach(
            function (action) {
            context('when docker fail to '+action+' this container', function() {
                beforeEach(function(done) {
                    error = new Error();

                    // First we need to manually setup a container.
                    return runner._createContainer(defaultCode)
                    .then(function(container) {
                        // We stub our container action to fail.
                        container[action] = sinon.stub().yields(error);

                        setFakeContainerCreate(null, container);

                        done();
                    })
                    .fail(function(err) {
                        done(err);
                    });
                });

                afterEach(function() {
                    revertContainerCreate();
                });

                expectError();
            });
        });

        // For this context we are testing against a
        // code sample that writes both on stdout and
        // stderr, returns an exit code of 1, with a
        // really short execution time.
        context('when container exits', function() {
            beforeEach(function(done) {
                emited = attachRunnerEvents();

                run(defaultCode, done);
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
                    expect(err).not.to.be.null;
                    done();
                });
            });

            it('has no container', function() {
                expect(runner.container).to.be.null;
            });
        });

        // For this context we are using a code sample
        // that should hang more than the test suite
        // default timeout, but runner should automatically
        // timeouts after maxExecutionTime and stop the
        // container, preventing these tests from timeouts.
        context('when execution is too long', function() {
            beforeEach(function() {
                fakeTimeout = 1;
                revert = Runner.__set__('MAX_EXECUTION_TIME', fakeTimeout);
            });

            afterEach(function() {
                revert();
            });

            it('emits a timeout and stops the container', function(done) {
                runner.on('timeout', function(executionTime) {
                    timeout = executionTime;
                });

                run(sleepCode, function(err) {
                    expect(timeout).to.equal(fakeTimeout);
                    done();
                });
            });
        });
    });

    describe('#stop()', function() {
        context('when idle', function() {
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
            beforeEach(function(done) {
                runner.on('start', function() {
                    runner.stop();
                });

                emited = attachRunnerEvents();

                run(sleepCode, done);
            });

            // We must verify that the container doesn't
            // stop because of the code sent as parameter.
            it('stops the container execution', function() {
                expect(emited.output.stderr).to.equal('');
            });

            it("hasn't emited container exit code", function() {
                expect(emited.exitCode).to.be.null;
            });
        });
    });

    function attachRunnerEvents() {
        var emited = {
            output: { stdout: '', stderr: '' },
            exitCode: null,
            timeout: null,
            container: null,
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

    function run(example, cb) {
        return runner.run(example)
        .then(function() {
            cb();
        })
        .fail(function(err) {
            cb(err);
        });
    }

    function expectError() {
        it('gets an error', function(done) {
            run(defaultCode, function(err) {
                expect(err).to.equal(error);
                done();
            });
        });
    }

    function setFakeContainerCreate(err, container) {
        containerCreate = runner.client.createContainer;

        // We stub our runner client to yield this container.
        runner.client.createContainer = sinon.stub().yields(err, container);
    }

    function revertContainerCreate() {
        if (typeof(containerCreate) == 'undefined') return;

        runner.client.createContainer = containerCreate;
    }
});
