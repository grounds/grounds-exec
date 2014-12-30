var expect = require('chai').expect,
    Factory = require('../spec_helper').FactoryGirl,
    socketURL = require('../spec_helper').socketURL,
    io = require('socket.io-client');

var options = {
  transports: ['websocket'],
  'force new connection': true
};

describe('Connection', function() {
    var sleepCode  = Factory.create('sleepCode'),
        stdoutCode = Factory.create('stdoutCode');

    beforeEach(function(){
        client = io.connect(socketURL, options);
    });

    afterEach(function(){
        client.disconnect();
    });

    it('can be establisehd', function(done) {
        client.on('connect', function(data) { done(); });
    });

    it('accepts run request and replies with output', function(done) {
        var i = 0;
        client.on('connect', function(data) {
            client.on('run', function(data){
                expect(data).to.deep.equal(stdoutCode.output[i]);
                ++i;

                if (data.stream === 'status') done();
            });
            client.emit('run', stdoutCode.input);
        });
    });

    it('stops previous run request when running a new run', function(done) {
        client.on('connect', function(data) {
            client.on('run', function(data){
                if (data.stream === 'status') done();
            });
            client.emit('run', sleepCode.input);
            setTimeout(function() {
                client.emit('run', stdoutCode.input);
            }, 600);
        });
    });

    context('when run request is empty', function() {
        var params = null;
        itRespondsWithBadRequestError(params);
    });

    context('when language code is empty', function() {
        var params = { code: 'puts "lol"' };
        itRespondsWithBadRequestError(params);
    });

    context('when code is empty', function() {
        it('accepts run request', function(done) {
            client.on('connect', function(data) {
                client.on('run', function(data){
                    if (data.stream === 'status') done();
                });
                client.emit('run', { language: 'ruby' });
            });
        });
    });

    it('prevents run request spam', function(done) {
        client.on('connect', function(data) {
            client.on('run', function(data){
                if (data.stream === 'ignored') done();
            });
            client.emit('run', stdoutCode.input);
            client.emit('run', stdoutCode.input);
        });
    });

    function itRespondsWithBadRequestError(params) {
        it('responds with a bad request error', function(done) {
            client.on('connect', function(data) {
                client.on('run', function(data){
                    if (data.stream === 'error') {
                        expect(data.chunk).to.eq('Bad request.');
                        done();
                    }
                });
                client.emit('run', params);
            });
        });
    }
});
