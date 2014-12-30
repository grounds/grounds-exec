var expect = require('chai').expect,
    docker = require('../spec_helper').docker,
    Factory = require('../spec_helper').FactoryGirl,
    Runner = require('../../lib/runner');

describe('Examples', function() {
    var examples = Factory.create('examples');

    beforeEach(function(){
        runner = new Runner(docker);
    });

    it('are properly configured', function() {
        expect(examples.list.length).to.be.above(0);
    });

    examples.list.forEach(function(example) {
        var ctx = 'when running '+example.language+' example '+example.title;

        context(ctx, function() {
            it('returns corresponding output', function(done) {
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
    });
});
