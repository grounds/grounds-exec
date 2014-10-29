var expect = require('chai').expect,
    Factory = require('./spec_helper').FactoryGirl,
    socketURL = require('./spec_helper').socketURL,
    io = require('socket.io-client');

var options = {
  transports: ['websocket'],
  'force new connection': true
};

describe('Server', function() {
    var sleepExample  = Factory.create('sleepExample'),
        stdoutExample = Factory.create('stdoutExample');
    
    beforeEach(function(){
        client = io.connect(socketURL, options);
    });
    
    afterEach(function(){
        client.disconnect();
    });
    
    it('accepts new connection', function(done) {
        client.on('connect', function(data) { done(); });
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

                if (data.stream === 'status') done();
            });
            client.emit('run', stdoutExample.input);
        });
    });
    
    it('stops previous run request when running a new run', function(done) {
        client.on('connect', function(data) {
            client.on('run', function(data){
                if (data.stream === 'status') done();
            });
            client.emit('run', sleepExample.input);
            setTimeout(function() {
                client.emit('run', stdoutExample.input);
            }, 600);
        });
    });

    context('when run request is empty', function() {
        it('responds with a bad request error', function(done) {
            client.on('connect', function(data) {
                client.on('run', function(data){
                    if (data.stream === 'error') {
                        expect(data.chunk).to.eq('Bad request.');
                        done();
                    }
                });
                client.emit('run', {});
            });
        });
    });
    
    it('prevents run request spam', function(done) {
        client.on('connect', function(data) {
            client.on('run', function(data){
                if (data.stream === 'ignored') done();
            });
            client.emit('run', stdoutExample.input);
            client.emit('run', stdoutExample.input);
        });
    });
});
