var expect = require('chai').expect,
    stream = require('../../lib/stream');

describe('WritableStream', function() {
    describe('#write()', function() {
        it('emits written message', function(done) {
            var writer = new stream.WritableStream(),
                msg    = 'test';

            writer.on('data', function(data) {
                expect(data).to.equal(msg);
                done();
            });
            writer.write(messageBytes(msg));
        });

        function messageBytes(msg) {
            var bytes = [];
            for (var i = 0; i < msg.length; ++i) {
                bytes.push(msg.charCodeAt(i));
            }
            return bytes;
        }
    });
});
