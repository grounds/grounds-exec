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
            runner.get('Memory', function(info) {
                expect(info).to.equal(maxMemory);
                done();
            });
        });

        it('creates a container with this language image', function(done) {
            var image = utils.formatImage(docker.repository, language);

            runner.get('Image', function(info) {
                expect(info).to.equal(image);
                done();
            });
        });

        it('creates a container with this code command', function(done) {
            var cmd = utils.formatCmd(code);

            runner.get('Cmd', function(info) {
                expect(info).to.deep.equal([cmd]);
                done();
            });
        });
    });

    describe('#run()', function() {
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

        // For this context we are testing against a
        // code sample that writes both on stdout and
        // stderr, returns an exit code of 1, with a
        // really short execution time.
        context('when container exits', function() {
            beforeEach(function(done) {
                prepareRun(defaultCode, function(err) {
                    if (err) return done(err);

                    container = runner.container;

                    runner.run(function(err) {

                        if (err) return done(err);

                        done();
                    });
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
                    expect(err).not.to.be.undefined;
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
                revert = Runner.__set__('maxExecutionTime', 1);

                prepareRun(sleepCode, done);
            });

            afterEach(function() {
                revert();
            });

            it('timeouts and stops the container', function(done) {
                runner.run(function(err) {
                    expect(output.stderr).to.equal('');

                    if (err) return done(err);

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
            });

            it('stops the container execution', function(done) {
                runner.run(function(err) {
                    expect(output.stderr).to.equal('');

                    if (err) return done(err);

                    done();
                });
                // We are not sure here that container is already started
                runner.stop();
            });

            it("hasn't emited container exit code", function(done) {
                runner.run(function(err) {
                    expect(exitCode).to.be.null;

                    if (err) return done(err);

                    done();
                });
                // waitUntil('Running' == true');
                // We are not sure here that container is already started
                runner.stop();
            });
        });
    });

    // Prepare a runner for the code example given,
    // listen on stdout, stderr and exit code then
    // call calback when container is created.
    function prepareRun(example, callback) {
        runner = new Runner(docker, example.language, example.code);

        output   = { stdout: '', stderr: '' };
        exitCode = null;

        runner.on('output', function(data) {
            output[data.stream] += data.chunk;
        }).on('status', function(data) {
            exitCode = data;
        });;

        runner.create(callback);
    }


        //context('when language is empty', function() {
            //expectErrorWith('', 'puts 42');
        //});

        //context('when code is too long', function() {
            //beforeEach(function() {
                //revert = Runner.__set__('maxSizeProgram', 0)
            //});

            //afterEach(function() {
                //revert();
            //});

            //expectErrorWith('ruby', '');
        //});

        //context('when docker failed to run a new container', function() {
            //expectErrorWith('unknown', '');
        //});

        //function expectErrorWith(language, code) {
            //it('emits an error', function(done) {
                //runner.on('output', function(data) {
                    //expect(data.stream).to.equal('error');
                    //done();
                //});
                //runner.run(language, code);
            //});
        //}

        //context('when it takes too long', function() {
            //beforeEach(function() {
                //revert = Runner.__set__('runTimeout', 1);
            //});

            //afterEach(function() {
                //revert();
            //});

            //it('timeouts and emits an error', function(done) {
                //runner.on('output', function(data) {
                    //if (data.stream !== 'error') return;

                    //expect(this.state).to.equal('timeout');
                    //done();
                //});
                //runner.run(sleepCode.language, sleepCode.code);
            //});
        //});
    //});
    /*});*/
});
