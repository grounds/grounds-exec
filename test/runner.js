var docker = require('./spec_helper').docker,
    expect = require('./spec_helper').expect,
    Factory = require('./spec_helper').FactoryGirl,
    Runner = require('../lib/runner');

describe('Runner', function() {

    var stdoutExample = Factory.create('stdoutExample'),
        stderrExample = Factory.create('stderrExample');

    describe('#run', function() {

        context('when language is empty', function() {

            it('emits an error', function(done) {
                var runner = new Runner(docker);

                runner.on('output', function(data) {
                    expect(data.stream).to.equal('error');
                    done();
                });
                runner.run('', 'puts 42'); 
            });
        });

        context('when code is too long', function() {

            it('emits an error', function(done) {
                var runner = new Runner(docker);

                runner.on('output', function(data) {
                    expect(data.stream).to.equal('error');
                    done();
                });

                var tooLongCode = '';

                for (var i = 0; i <= Runner.maxSizeProgram; ++i) {
                    tooLongCode += '0';
                }
                runner.run('ruby', tooLongCode); 
            });
        });

        context('when language and code are valid', function() {

            it('runs code inside a docker container and emits output', function(done) {
                var runner = new Runner(docker);
                var i = 0;
                runner.on('output', function(data) {
                    expect(data).to.deep.equal(stdoutExample.output[i]);
                    if (data.stream === 'status')
                        done(); 
                    ++i;
                });
                runner.run(stdoutExample.language, stdoutExample.code);
            });

            it('runs code inside a docker container and emits also stderr', function(done) {
                var runner = new Runner(docker);
                var i = 0;
                var hasOutputOnStderr = false;

                runner.on('output', function(data) {
                    if (data.stream === 'stderr') {
                        hasOutputOnStderr = true;
                    }
                    if (data.stream === 'status') {
                        expect(hasOutputOnStderr).to.equal(true);
                        done();
                    }
                    ++i;
                });
                runner.run(stderrExample.language, stderrExample.code);
            });

            it('removes docker container after a run', function(done) {
                var runner = new Runner(docker);

                runner.on('output', function(data) {
                    if (data.stream !== 'status') return;

                    runner._container.remove(function(err, data) {
                        expect(err).not.to.equal(null);
                        done();
                    }); 
                });
                runner.run(stdoutExample.language, stdoutExample.code);
            });

            it('timeouts if it takes too long', function(done) {
                done();
            }); 
        });
    });

    describe('#stop', function() {

    });
});
