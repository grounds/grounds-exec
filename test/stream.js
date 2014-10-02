var expect = require('./spec_helper').expect,
    stream = require('../lib/stream');

describe('WritableStream', function() {

    describe('#write()', function() {

        it('emits written message', function(done) {
            var writer = new stream.WritableStream(),
                msg    = 'test';

            writer.on('data', function(data) {
                expect(data).to.equal(msg);
                done();
            });

            var bytes = [];
            for (var i = 0; i < msg.length; ++i) {
                bytes.push(msg.charCodeAt(i));
            }
            writer.write(bytes);
        });
    });
});
