var rewire = require('rewire'),
    sinon = require('sinon'),
    expect = require('chai').expect,
    io = require('socket.io-client'),
    Factory = require('../spec_helper').FactoryGirl,
    docker = require('../spec_helper').docker,
    socket = require('../spec_helper').socket,
    server = rewire('../../lib/server'),
    Connection = rewire('../../lib/connection');

describe('Connection', function() {
    var sleepCode   = Factory.create('sleepCode'),
        defaultCode = Factory.create('defaultCode');

    // Setup a fake server without logs.
    before(function() {
        fakeLogger = { log: sinon.stub(), error: sinon.stub() };
        Connection.__set__('logger', fakeLogger);
        server.__set__('logger', fakeLogger);
        server.__set__('Connection', Connection);
        server.listen(socket.port, docker);
    });

    after(function() {
        server.close();
    });

    beforeEach(function(done){
        client = io.connect(socket.URL, socket.options);
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
            client.emit('run', runOpts(sleepCode));
        });

        it('a new run request stops previous runner', function(done) {
            client.on('run', runHandler(done, function(output) {
                expect(defaultCode).to.contain.all.keys(output);
            }));

            setTimeout(function() {
                client.emit('run', runOpts(defaultCode));
            }, 600);
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
