var rewire  = require('rewire'),
    sinon = require('sinon'),
    expect = require('chai').expect,
    docker = require('../spec_helper').docker,
    Factory = require('../spec_helper').FactoryGirl,
    Runner = rewire('../../lib/runner');

describe('Runner', function() {
    var sleepCode  = Factory.create('sleepCode');

    beforeEach(function() {
        runner = new Runner(docker);
    });

    describe('#run()', function() {
        it('runs input code and write on stdout', function(done) {
            expectOutputOn('stdout', done);
        });

        it('runs input code and write on stderr', function(done) {
            expectOutputOn('stderr', done);
        });

        function expectOutputOn(stream, done) {
            var output = 'hello world';

            runner.on('output', function(data) {
                if (data.stream !== stream) return;

                var chunk = data.chunk.replace('\n', '');

                if (!chunk) return;

                expect(chunk).to.equal(output);
                done();
            });
            runner.run('ruby', '$'+stream+'.puts "'+output+'"');
        }

        it('returns its container status code', function(done) {
            runner.on('output', function(data) {
                if (data.stream !== 'status') return;

                expect(data.chunk).to.equal(0);
                done();
            });
            runner.run('ruby', '');
        });

        it('removes its container after a run', function(done) {
            runner.on('output', function(data) {
                if (data.stream !== 'status') return;

                runner._container.inspect(function(err, data){
                    var finished = !!err || !!data.State.FinishedAt;

                    expect(finished).to.equal(true);
                    done();
                });
            });
            runner.run('ruby', 'puts 42');
        });

        context('when language is empty', function() {
            expectErrorWith('', 'puts 42');
        });

        context('when code is too long', function() {
            beforeEach(function() {
                revert = Runner.__set__('maxSizeProgram', 0)
            });

            afterEach(function() {
                revert();
            });

            expectErrorWith('ruby', '');
        });

        context('when docker failed to run a new container', function() {
            expectErrorWith('unknown', '');
        });

        function expectErrorWith(language, code) {
            it('emits an error', function(done) {
                runner.on('output', function(data) {
                    expect(data.stream).to.equal('error');
                    done();
                });
                runner.run(language, code);
            });
        }

        context('when it takes too long', function() {
            beforeEach(function() {
                revert = Runner.__set__('runTimeout', 1);
            });

            afterEach(function() {
                revert();
            });

            it('timeouts and emits an error', function(done) {
                runner.on('output', function(data) {
                    if (data.stream !== 'error') return;

                    expect(this.state).to.equal('timeout');
                    done();
                });
                runner.run(sleepCode.language, sleepCode.code);
            });

            it("doesn't return its container status code", function(done) {
                var statusCode = null;

                runner.on('output', function(data) {
                    if (data.stream === 'status')
                        statusCode = data.chunk;
                    if (data.stream !== 'error') return;

                    expect(statusCode).to.equal(null);
                    done();
                });
                runner.run(sleepCode.language, sleepCode.code);
            });
        });
    });

    describe('#stop()', function() {
        it('stops a running container', function(done) {
            runner.on('output', function(data) {
                if (data.stream === 'start') this.stop();
                if (data.stream !== 'status') return;

                expect(this.state).to.equal('finished');
                done();
            });
            runner.run(sleepCode.language, sleepCode.code);
        });

        context('when runner has no container', function() {
            it("doesn't fail", function() {
                runner._container = null;
                runner.stop();
            });
        });
    });
});
