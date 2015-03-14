var sinon = require('sinon'),
    expect = require('chai').expect,
    io = require('socket.io-client'),
    Server = require('../support/server'),
    Factory = require('../spec_helper').FactoryGirl;

var server = new Server();

describe('Run some code', function() {
    var sleepCode   = Factory.create('sleepCode'),
        defaultCode = Factory.create('defaultCode');

    // Setup a fake server without logs.
    before(function() {
        server.listen();
    });

    after(function() {
        server.close();
    });

    beforeEach(function(done){
        client = io.connect(server.URL, server.options);
        client.on('connect', function() {
            done();
        }).on('connect_error', function(err) {
            done(err);
        });
    });

    afterEach(function(){
        client.disconnect();
    });

    it('accepts run request and replies with proper output', function(done) {
        client.on('run', runHandler(done, function(output) {
            expect(defaultCode).to.contain.all.keys(output);
        }));
        client.emit('run', runOpts(defaultCode));
    });

    context('when run request is empty', function() {
        it('responds with an error', function(done) {
            client.on('run', runHandler(done, function(data) {
                expect(data).to.contain.all.keys({ stream: 'error', chunk: 'Empty request.' });
            }));
            client.emit('run');
        });
    });

    context('when run request language is not specified', function() {
        it('responds with an error', function(done) {
            client.on('run', runHandler(done, function(data) {
                expect(data).to.contain.all.keys({ stream: 'error', chunk: 'Docker error.' });
            }));
            client.emit('run', {});
        });
    });

    it('prevents run request spam', function(done) {
        client.on('run', function(data) {
            if (data.stream !== 'error') return;

            expect(data).to.contain.all.keys({ stream: 'error', chunk: 'Spam prevention.' });

            done();
        });
        client.emit('run', runOpts(defaultCode));
        client.emit('run', runOpts(defaultCode));
    });

    context('when previous run is still running', function() {
        beforeEach(function() {
            clock = sinon.useFakeTimers();
        });

        afterEach(function() {
            clock.restore();
        });

        it('a new run request stops previous runner', function(done) {
            client.on('run', function(data) {
                switch (data.stream) {
                    case 'start':
                        clock.tick(600);
                        client.emit('run', runOpts(defaultCode));
                        break;
                    case 'stop':
                        done();
                }
            });
            client.emit('run', runOpts(defaultCode));
        });
    });

    context('when run is too long', function() {
        beforeEach(function() {
            clock = sinon.useFakeTimers();
        });

        afterEach(function() {
            clock.restore();
        });

        it('emits a timeout error', function(done) {
            client.on('run', function(data) {
                switch (data.stream) {
                    case 'start':
                        clock.tick(20000);
                        break;
                    case 'error':
                        done();
                }
            });
            client.emit('run', runOpts(sleepCode));
        });
    });

    function runOpts(example){
        return { language: example.language, code: example.code };
    }

    function runHandler(done, callback) {
        var output = {
            stdout: '',
            stderr: '',
            exitCode: null
        };

        return function(data) {
            switch (data.stream) {
                case 'stdout':
                case 'stderr':
                    output[data.stream] += data.chunk;
                    break;
                case 'status':
                    output.exitCode = data.chunk;
                    callback(output);
                    done();
                    break;
                case 'error':
                    callback(data);
                    done();
            }
        };
    }
});
