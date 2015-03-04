var rewire  = require('rewire'),
    sinon = require('sinon'),
    expect = require('chai').expect,
    docker = require('../spec_helper').docker,
    Factory = require('../spec_helper').FactoryGirl,
    utils = require('../../lib/utils'),
    Runner = rewire('../../lib/runner');

var maxMemory = Runner.__get__('maxMemory');

describe('Runner', function() {
    var sleepCode  = Factory.create('sleepCode');

    beforeEach(function() {
        language = 'ruby'
        code     = 'puts "hello world!"; $stderr.puts "hello stderr!"; exit 1'
        runner   = new Runner(docker, language, code);
    });

    it('uses this docker client', function() {
        expect(runner.client).to.equal(docker);
    });

    it('uses apropriate image with this language', function() {
        var image = utils.formatImage(docker.repository, language);

        expect(runner.image).to.equal(image);
    });

    it('uses apropriate command with this code', function() {
        var cmd = utils.formatCmd(code);

        expect(runner.cmd).to.equal(cmd);
    });

    describe('#create()', function() {
        beforeEach(function(done) {
            runner.create(done);
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

        it('is attached on this container stdout', function(done) {
            runner.get('AttachStdout', function(info) {
                expect(info).to.be.true;
                done();
            });
        });

        it('is attached on this container stderr', function(done) {
            runner.get('AttachStderr', function(info) {
                expect(info).to.be.true;
                done();
            });
        });

        it('creates a container with this image', function(done) {
            runner.get('Image', function(info) {
                expect(info).to.equal(runner.image);
                done();
            });
        });

        it('creates a container with this command', function(done) {
            runner.get('Cmd', function(info) {
                expect(info).to.deep.equal([runner.cmd]);
                done();
            });
        });
    });

    describe('#run()', function() {
        beforeEach(function(done) {
            prepareRun(done);
        });

        context('when container exits', function() {
            beforeEach(function(done) {
                container = runner.container;

                runner.run(function(err) {
                    done();
                });
            });

            it('has emited container exit code', function() {
                expect(exitCode).to.equal(1);
            });

            it('has emiteded appropriate output on stdout', function() {
                expect(output.stdout).to.equal('hello world!\n');
            });

            it('has emiteded appropriate output on stderr', function() {
                expect(output.stderr).to.equal('hello stderr!\n');
            });

            it('removes its container', function(done) {
                container.inspect(function(err, data) {
                    expect(err).not.to.be.null;
                    done();
                });
            });
        });

        function prepareRun(done) {
            output = { stdout: '', stderr: '' };

            runner.on('output', function(data) {
                output[data.stream] += data.chunk;
            }).on('status', function(data) {
                exitCode = data;
            });;

            runner.create(done);
        }
    });



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

            //it("doesn't return its container status code", function(done) {
                //var statusCode = null;

                //runner.on('output', function(data) {
                    //if (data.stream === 'status')
                        //statusCode = data.chunk;
                    //if (data.stream !== 'error') return;

                    //expect(statusCode).to.equal(null);
                    //done();
                //});
                //runner.run(sleepCode.language, sleepCode.code);
            //});
        //});
    //});

    //describe('#stop()', function() {
        //it('stops a running container', function(done) {
            //runner.on('output', function(data) {
                //if (data.stream === 'start') this.stop();
                //if (data.stream !== 'status') return;

                //expect(this.state).to.equal('finished');
                //done();
            //});
            //runner.run(sleepCode.language, sleepCode.code);
        //});

        //context('when runner has no container', function() {
            //it("doesn't fail", function() {
                //runner._container = null;
                //runner.stop();
            //});
        //});
    /*});*/
});
