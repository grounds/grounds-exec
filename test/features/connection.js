var rewire = require('rewire'),
    sinon = require('sinon'),
    expect = require('chai').expect,
    io = require('socket.io-client'),
    Factory = require('../spec_helper').FactoryGirl,
    docker = require('../spec_helper').docker,
    server = rewire('../../lib/server');

var socket = {
    port: 8080,
    URL: 'http://127.0.0.1:8080',
    options: { transports: ['websocket'], 'force new connection': true }
}

describe('Connection', function() {
    var sleepCode  = Factory.create('sleepCode'),
        stdoutCode = Factory.create('stdoutCode');

    before(function() {
        server.__set__('logger', { log: sinon.stub() });
        server.listen(socket.port, docker);
    });

    beforeEach(function(){
        client = io.connect(socket.URL, socket.options);
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
