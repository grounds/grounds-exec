var docker = require('./spec_helper').docker,
    expect = require('./spec_helper').expect,
    Factory = require('./spec_helper').FactoryGirl,
    Runner = require('../lib/runner');

describe('Runner', function() {
    var sleepExample  = Factory.create('sleepExample'),
        examples      = Factory.create('examples');

    beforeEach(function(){
        runner = new Runner(docker);
    });

    describe('#run()', function() {
        it('has different examples to run', function() {
            expect(examples.list.length).to.be.above(0);
        });
       
        examples.list.forEach(function(example) {
            var title = 'runs '+ example.language +' example: '+ example.title;

            it(title, function(done) {
                this.timeout(3000);

                var output = '';

                runner.on('output', function(data) {
                    if (data.stream === 'stdout' || data.stream === 'stderr')
                        output += data.chunk; 
                    if (data.stream !== 'status') return;
                    
                    expect(output).to.equal(example.output);
                    done();
                });
                runner.run(example.language, example.code);
            });
        });

        it('returns its container status code', function(done) {
            runner.on('output', function(data) {
                if (data.stream !== 'status') return;
                
                expect(data.chunk).to.equal(1);
                done();
            });
            runner.run('ruby', 'exit 1');
        });

        it('removes its container after a run', function(done) {
            runner.on('output', function(data) {
                if (data.stream !== 'status') return;

                runner._container.inspect(function(err, data){
                    var finished = err !== null || 
                        data.State.FinishedAt !== null;

                    expect(finished).to.equal(true);
                    done();
                });
            });
            runner.run('ruby', 'puts 42');
        });

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

        context('when it takes too long', function() {
            it('timeouts and emits an error', function(done) {
                runner._runTimeout = 1;

                runner.on('output', function(data) {
                    if (data.stream !== 'error') return;

                    done();
                });
                runner.run(sleepExample.language, sleepExample.code);
            });
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
