var expect = require('./spec_helper').expect,
    socketURL = require('./spec_helper').socketURL,
    Factory = require('./spec_helper').FactoryGirl,
    io = require('socket.io-client');

var options = {
  transports: ['websocket'],
  'force new connection': true
};

describe('Server', function() {
    var stdoutExample = Factory.create('stdoutExample');
    
    beforeEach(function(){
        client = io.connect(socketURL, options);
    });
    
    it('accepts new connection', function(done) {
        client.on('connect', function(data) {
            client.disconnect();
            done();
        });
    });
    
    it('accepts run request and replies with output', function(done) {
        var output = [
            { stream: 'start',  chunk: '' },
            { stream: 'stdout', chunk: '42\n' },
            { stream: 'status', chunk: 0 }
        ];
        var i = 0;
        client.on('connect', function(data) {
            client.on('run', function(data){
                expect(data).to.deep.equal(stdoutExample.output[i]);
                ++i;

                if (data.stream === 'status') {
                    client.disconnect();
                    done();
                }
            });
            client.emit('run', stdoutExample.input);
        });
    });
    
    it('prevents run request spam', function(done) {
        var i = 0;
        client.on('connect', function(data) {
            client.on('run', function(data){
                if (data.stream === 'ignored') {
                    client.disconnect();
                    done(); 
                }
            });
            client.emit('run', stdoutExample.input);
            client.emit('run', stdoutExample.input);
        });
    });
});
