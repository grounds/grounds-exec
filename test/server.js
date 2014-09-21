var expect = require('./spec_helper').expect,
    socketURL = require('./spec_helper').socketURL,
    io = require('socket.io-client');

var options = {
  transports: ['websocket'],
  'force new connection': true
};

describe('Server', function() {
    
    it('accepts new connection', function(done) {
        var client = io.connect(socketURL, options);

        client.on('connect', function(data) {
            client.disconnect();
            done();
        });
    });
    
    it('accepts run request and replies with output', function(done) {
        var client = io.connect(socketURL, options);
        var output = [
            { stream: 'start',  chunk: '' },
            { stream: 'stdout', chunk: '42\n' },
            { stream: 'status', chunk: 0 }
        ];
        var i = 0;
        client.on('connect', function(data) {
            client.on('run', function(data){
                expect(data).to.deep.equal(output[i]);
                ++i;

                if (data.stream === 'status') {
                    client.disconnect();
                    done();
                }
            });
            client.emit('run', { language: 'python2', code: 'print 42' });
        });
    });
    
    it('prevents run request spam', function(done) {
        var client = io.connect(socketURL, options);
        var i = 0;
        client.on('connect', function(data) {
            client.on('run', function(data){
                if (data.stream === 'ignored') {
                    client.disconnect();
                    done(); 
                }
            });
            client.emit('run', { language: 'python2', code: 'print 42' });
            client.emit('run', { language: 'python2', code: 'print 42' });
        });
    });
});
