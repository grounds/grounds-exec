var rewire  = require('rewire'),
    sinon = require('sinon'),
    expect = require('chai').expect,
    docker = require('../spec_helper').docker,
    Factory = require('../spec_helper').FactoryGirl,
    utils = require('../../lib/utils'),
    Runner = rewire('../../lib/runner');

var maxMemory = Runner.__get__('maxMemory'),
    maxExecutionTime = Runner.__get__('maxExecutionTime');

describe('Runner', function() {
    var sleepCode   = Factory.create('sleepCode'),
        defaultCode = Factory.create('defaultCode');

    it('has a max execution time of 10 seconds', function() {
        expect(maxExecutionTime / 1000).to.equal(10);
    });

    describe('#create()', function() {
        beforeEach(function(done) {
            language = defaultCode.language;
            code = defaultCode.code;

            runner = new Runner(docker, language, code);
            runner.create(done);
        });

        it('uses this docker client', function() {
            expect(runner.client).to.equal(docker);
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
            var image = utils.formatImage(docker.repository, language);

            return runner.get('Image')
            .then(function(info) {
                expect(info).to.equal(image);
                done();
            });
        });

        it('creates a container with this code command', function(done) {
            var cmd = utils.formatCmd(code);

            return runner.get('Cmd')
            .then(function(info) {
                expect(info).to.deep.equal([cmd]);
                done();
            });
        });

        context('when container creation failed', function(done) {
            beforeEach(function() {
                runner = new Runner(docker, 'unknown', '');

                expected = new Error('Create failed.');

                revert = docker.createContainer;
                docker.createContainer = sinon.stub().yields(expected);
            });

            afterEach(function() {
                docker.createContainer = revert;
            });

            it('calls create callback with an error', function(done) {
                runner.create(function(err) {
                    expect(err).to.equal(expected);
                    done();
                });
            });
        });
    });

    describe('#run()', function() {
        context('when everything is valid', function() {
            beforeEach(function(done) {
                prepareRun(defaultCode, function(err) {
                    if (err) return done(err);

                    done();
                });
            });

            it('call run callback without error', function(done) {
                runner.run(function(err) {
                    expect(err).to.be.null;
                    done();
                });
            });
        });

        context('when container is not yet created', function() {
            beforeEach(function() {
                runner = new Runner(docker, '', '');
            });

            it('throws an error', function() {
                expect(function() {
                    runner.run(function() {});
                }).to.throw(Error);
            });
        });

        context('when docker fail to attach to this container', function() {
            beforeEach(function(done) {
                prepareRun(defaultCode, function(err) {
                    if (err) return done(err);

                    runner.container.attach = sinon.stub().yields(new Error());

                    done();
                });
            });

            expectRunCallbackWithError();
        });

        context('when docker fail to start this container', function() {
            beforeEach(function(done) {
                prepareRun(defaultCode, function(err) {
                    if (err) return done(err);

                    runner.container.start = sinon.stub().yields(new Error());

                    done();
                });
            });

            expectRunCallbackWithError();
        });

        context('when docker fail to wait for this container', function() {
            beforeEach(function(done) {
                prepareRun(defaultCode, function(err) {
                    if (err) return done(err);

                    runner.container.wait = sinon.stub().yields(new Error());

                    done();
                });
            });

            expectRunCallbackWithError();
        });

        context('when docker fail to inspect this container', function() {
            beforeEach(function(done) {
                prepareRun(defaultCode, function(err) {
                    if (err) return done(err);

                    runner.container.inspect = sinon.stub().yields(new Error());

                    done();
                });
            });

            expectRunCallbackWithError();
        });

        context('when docker fail to remove this container', function() {
            beforeEach(function(done) {
                prepareRun(defaultCode, function(err) {
                    if (err) return done(err);

                    runner.container.remove = sinon.stub().yields(new Error());

                    done();
                });
            });

            expectRunCallbackWithError();
        });

        // For this context we are testing against a
        // code sample that writes both on stdout and
        // stderr, returns an exit code of 1, with a
        // really short execution time.
        context('when container exits', function() {
            beforeEach(function(done) {
                prepareRun(defaultCode, function(err) {
                    if (err) return done(err);

                    container = runner.container;

                    runner.run(done);
                });
            });

            it('has emited container exit code', function() {
                expect(exitCode).to.equal(defaultCode.exitCode);
            });

            it('has emiteded appropriate output on stdout', function() {
                expect(output.stdout).to.equal(defaultCode.stdout);
            });

            it('has emiteded appropriate output on stderr', function() {
                expect(output.stderr).to.equal(defaultCode.stderr);
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

        // For this context we are using a code sample
        // that should hang more than the test suite
        // default timeout, but runner should automatically
        // timeouts after maxExecutionTime and stop the
        // container, preventing these tests from timeouts.
        context('when execution is too long', function() {
            beforeEach(function(done) {
                fakeTimeout = 1;
                revert = Runner.__set__('maxExecutionTime', fakeTimeout);

                prepareRun(sleepCode, done);
            });

            afterEach(function() {
                revert();
            });

            it('emit a timeout and stops the container', function(done) {
                runner.run(function(err) {
                    if (err) return done(err);

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
        // default timeout, if stops fails, these tests
        // should timeout.
        context('when running some code', function() {
            beforeEach(function(done) {
                prepareRun(sleepCode, done);

                runner.on('start', function() {
                    runner.stop();
                });
            });

            it('stops the container execution', function(done) {
                runner.run(function(err) {
                    if (err) return done(err);

                    expect(output.stderr).to.equal('');

                    done();
                });
            });

            it("hasn't emited container exit code", function(done) {
                runner.run(function(err) {
                    if (err) return done(err);

                    expect(exitCode).to.be.null;

                    done();
                });
            });
        });
    });

    // Prepare a runner for the code example given,
    // listen on stdout, stderr and exit code then
    // call calback when container is created.
    function prepareRun(example, callback) {
        runner = new Runner(docker, example.language, example.code);

        output   = { stdout: '', stderr: '' };
        exitCode = null,
        timeout  = null;

        runner.on('output', function(data) {
            output[data.stream] += data.chunk;
        }).on('status', function(data) {
            exitCode = data;
        }).on('timeout', function(data){
            timeout = data;
        });

        runner.create(callback);
    }

    function expectRunCallbackWithError() {
        it('call callback with an error', function(done) {
            runner.run(function(err) {
                expect(err).not.to.be.null;
                done();
            });
        });
    }
});
