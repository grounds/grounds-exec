var docker = require('./spec_helper').docker,
    expect = require('./spec_helper').expect,
    Factory = require('./spec_helper').FactoryGirl,
    Runner = require('../lib/runner');

describe('Runner', function() {

    var stdoutExample = Factory.create('stdoutExample'),
        stderrExample = Factory.create('stderrExample'),
        sleepExample  = Factory.create('sleepExample'),
        examples = Factory.create('examples');

    beforeEach(function(){
        runner = new Runner(docker);
    });

    describe('#run()', function() {

        context('when language is empty', function() {

            it('emits an error', function(done) {
                runner.on('output', function(data) {
                    expect(data.stream).to.equal('error');
                    done();
                });
                runner.run('', 'puts 42'); 
            });
        });

        context('when code is too long', function() {

            it('emits an error', function(done) {
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

            it('removes its docker container after a run', function(done) {
                runner.on('output', function(data) {
                    if (data.stream !== 'status') return;

                    //sleep(1000);
                    runner._container.inspect(function(err, data){
                        var finished = err !== null || 
                                       data.State.FinishedAt !== null;

                        expect(finished).to.equal(true);
                        done();
                    });
                });
                runner.run(stdoutExample.language, stdoutExample.code);
            });

            context('when it takes too long', function() {

                it('timeouts', function(done) {
                    runner._runTimeout = 1;

                    runner.on('output', function(data) {
                        if (data.stream !== 'error') return;

                        done();
                    });
                    runner.run(sleepExample.language, sleepExample.code);
                });
            });
        });
        
        it('has different languages examples to run', function() {
            expect(examples.list.length).to.be.above(0);
        });
        
        context('with different languages examples', function() {
            for (var i in examples.list) {
                var example = examples.list[i];

                it('runs '+ example.language +' code', function(done) {
                    var output = '';

                    runner.on('output', function(data) {
                        if (data.stream === 'stdout')
                            output += data.chunk; 
                        if (data.stream !== 'status') return;
                        
                        expect(output).to.equal(example.output);
                        done();
                    });
                    runner.run(example.language, example.code);
                });
            }
        });
    });

    describe('#stop()', function() {
        it('stops a running container', function(done) {
            runner.on('output', function(data) {
                if (data.stream === 'start') runner.stop();
                if (data.stream !== 'status') return;
                            
                done();
            });
            runner.run(sleepExample.language, sleepExample.code);
        });
    });
});