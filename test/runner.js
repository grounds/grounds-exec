var docker = require('./spec_helper').docker,
    expect = require('./spec_helper').expect,
    Runner = require('../lib/runner');

describe('Runner', function() {

    describe('run', function() {

        describe('when language is empty', function() {

            it('emits an error', function(done) {
                var runner = new Runner(docker);

                runner.on('output', function(data) {
                    expect(data.stream).to.equal('error');
                    done();
                });
                runner.run('', 'puts 42'); 
            });
        });

        describe('when code is too long', function() {

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

        describe('when language and code are valid', function() {

            it('runs code inside a docker container and emits output', function(done) {
                var runner = new Runner(docker);
                var output = [
                    { stream: 'start',  chunk: '' },
                    { stream: 'stdout', chunk: '42\n' },
                    { stream: 'status', chunk: 0 }
                ];
                var i = 0;
                runner.on('output', function(data) {
                    expect(data).to.deep.equal(output[i]);
                    if (data.stream === 'status')
                        done(); 
                    ++i;
                });
                runner.run('python2', 'print 42');
            });

            it('runs code inside a docker container and emits also stderr', function(done) {
                var runner = new Runner(docker);
                var output = [
                    { stream: 'start',  chunk: '' },
                    { stream: 'stderr', chunk: '42\n' },
                    { stream: 'status', chunk: 0 }
                ];
                var i = 0;
                runner.on('output', function(data) {
                    expect(data).to.deep.equal(output[i]);
                    if (data.stream === 'status')
                        done(); 
                    ++i;
                });
                runner.run('ruby', '$stderr.puts 42');
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
                runner.run('python2', 'print 42');
            });

            it('timeouts if it takes too long', function(done) {
                done();
            }); 
        });
    });

    describe('stop', function() {

    });
});
