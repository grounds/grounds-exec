var rewire  = require('rewire'),
    sinon = require('sinon'),
    expect = require('chai').expect,
    Factory = require('../spec_helper').Factory,
    utils = require('../../lib/utils'),
    docker = require('../../lib/docker'),
    Runner = rewire('../../lib/runner');

var maxMemory = Runner.__get__('maxMemory'),
    maxExecutionTime = Runner.__get__('maxExecutionTime');

describe('Runner', function() {
    var sleepCode   = Factory.create('sleepCode'),
        defaultCode = Factory.create('defaultCode');

    it('has a max execution time of 10 seconds', function() {
        expect(maxExecutionTime / 1000).to.equal(10);
    });

    beforeEach(function() {
        runner = new Runner();
    });

    describe('#create()', function() {
        beforeEach(function(done) {
            create(defaultCode, done);
        });

        it('creates a container', function() {
            expect(runner.container).not.to.be.null;
        });

        it('creates a container with maxMemory set', function(done) {
            return runner.get('Memory')
            .then(function(info) {
                expect(info).to.equal(maxMemory);
                done();
            });
        });

        it('creates a container with this language image', function(done) {
            var image = utils.formatImage(
                docker.getClient().repository,
                defaultCode.language
            );

            return runner.get('Image')
            .then(function(info) {
                expect(info).to.equal(image);
                done();
            });
        });

        it('creates a container with this code command', function(done) {
            var cmd = utils.formatCmd(defaultCode.code);

            return runner.get('Cmd')
            .then(function(info) {
                expect(info).to.deep.equal([cmd]);
                done();
            });
        });

        context('when container creation failed', function(done) {
            beforeEach(function() {
                error = new Error();

                revert = runner.client.createContainer;

                runner.client.createContainer = sinon.stub().yields(error);
            });

            afterEach(function() {
                runner.client.createContainer = revert;
            });

            it('gets an error', function(done) {
                return runner.create(defaultCode)
                .then(function () {
                    done('runner created a container but it should not');
                })
                .fail(function (err) {
                    expect(err).to.equal(error);
                    done();
                });
            });
        });
    });

    describe('#run()', function() {
        // For this context we are testing against a
        // code sample that writes both on stdout and
        // stderr, returns an exit code of 1, with a
        // really short execution time.
        context('when container is created', function() {
            beforeEach(function(done) {
                create(defaultCode, done);
            });

            it('runs the container', function(done) {
                run(done);
            });

            ['attach', 'start', 'wait', 'inspect', 'remove'].forEach(
                function (action) {
                context('when docker fail to '+action+' this container', function() {
                    beforeEach(function() {
                        error = new Error();

                        runner.container[action] = sinon.stub().yields(error);
                    });

                    it('gets an error', function(done) {
                        return runner.run()
                        .then(function() {
                            done('container '+action+' did not fail.');
                        })
                        .fail(function (err) {
                            expect(err).to.equal(error);
                            done();
                        });
                    });
                });
            });

            context('when container exits', function() {
                beforeEach(function(done) {
                    emited = attachRunnerEvents();

                    container = runner.container;

                    run(done);
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
                    container.inspect(function(err, data) {
                        expect(err).not.to.be.null;
                        done();
                    });
                });

                it('has no container', function() {
                    expect(runner.container).to.be.null;
                });
            });
        });

        context('when container is not yet created', function() {
            it('throws an error', function() {
                expect(function() {
                    runner.run();
                }).to.throw(Error);
            });
        });

        // For this context we are using a code sample
        // that should hang more than the test suite
        // default timeout, but runner should automatically
        // timeouts after maxExecutionTime and stop the
        // container, preventing these tests from timeouts.
        context('when execution is too long', function() {
            beforeEach(function(done) {
                fakeTimeout = 1;
                revert = Runner.__set__('maxExecutionTime', fakeTimeout);

                emited = attachRunnerEvents();

                create(sleepCode, done);
            });

            afterEach(function() {
                revert();
            });

            it('emits a timeout and stops the container', function(done) {
                runner.on('timeout', function(executionTime) {
                    timeout = executionTime;
                });

                run(done, function() {
                    expect(timeout).to.equal(fakeTimeout);
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

                create(sleepCode, done);
            });

            // We must verify that the container doesn't
            // stop because of the code sent as parameter.
            it('stops the container execution', function(done) {
                run(done, function() {
                    expect(emited.output.stderr).to.equal('');
                });
            });

            it("hasn't emited container exit code", function(done) {
                run(done, function() {
                    expect(emited.exitCode).to.be.null;
                });
            });
        });
    });

    function create(example, done) {
        return runner.create(example)
        .then(function (container) {
            done();
        })
        .fail(function (err) {
            done(err);
        });
    }

    function run(done, callback) {
        return runner.run()
        .then(function() {
            if (typeof(callback) !== 'undefined')
                callback();
            done();
        })
        .fail(function (err) {
            done(err);
        });
    }

    function attachRunnerEvents() {
        var emited = {
            output: { stdout: '', stderr: '' },
            exitCode: null,
            timeout: null
        }

        runner.on('output', function(data) {
            emited.output[data.stream] += data.chunk;
        }).on('status', function(data) {
            emited.exitCode = data;
        }).on('timeout', function(data){
            emited.timeout = data;
        });
        return emited;
    }
});
