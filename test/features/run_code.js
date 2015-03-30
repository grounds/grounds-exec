var sinon = require('sinon'),
    expect = require('chai').expect,
    rewire = require('rewire'),
    io = require('socket.io-client'),
    Server = require('../support/server'),
    Factory = require('../spec_helper').Factory;

var server = new Server();

var error = rewire('../../lib/handlers/run').__get__('error');

describe('Run some code', function() {
    var sleepCode     = Factory.create('sleepCode'),
        defaultCode   = Factory.create('defaultCode'),
        tooLongCode   = Factory.create('tooLongCode'),
        undefinedCode = Factory.create('undefinedCode');

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

    expectProperResponse(defaultCode);

    context('when run request is empty', function() {
        it('responds with an error', function(done) {
            client.on('run', runHandler(done, function(response) {
                expectErrorResponse(response, error.EmptyRequest);
            }));
            client.emit('run');
        });
    });

    context('when run request language is not specified', function() {
        it('responds with an error', function(done) {
            client.on('run', runHandler(done, function(data) {
                expect(data.stream).to.equal('error');
            }));
            client.emit('run', { code: '' });
        });
    });

    context('when run request code is empty', function() {
        expectProperResponse(undefinedCode);
    });

    context('when run request code is too long', function() {
        expectErrorResponse(tooLongCode, error.ProgramTooLong);
    });

    it('prevents run request spam', function(done) {
        client.on('run', function(data) {
            if (data.stream !== 'error') return;

            expect(data.chunk).to.equal(error.SpamPrevention.message);

            done();
        });
        client.emit('run', defaultCode);
        client.emit('run', defaultCode);
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
                        client.emit('run', defaultCode);
                        break;
                    case 'stop':
                        done();
                }
            });
            client.emit('run', defaultCode);
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
            client.emit('run', sleepCode);
        });
    });

    function expectProperResponse(example) {
        it('accepts run request and replies with proper response', function(done) {
            client.on('run', runHandler(done, function(response) {
                var expected = {};

                ['stdout', 'stderr', 'exitCode'].forEach(function(prop) {
                    expected[prop] = example[prop];
                });
                expect(response).to.deep.equal(expected);
            }));
            client.emit('run', example);
        });
    }

    function expectErrorResponse(example, err) {
        var expected = { stream: 'error', chunk: err.message };

        it('responds with an error', function(done) {
            client.on('run', runHandler(done, function(response) {
                expect(response).to.deep.equal(expected);
            }));
            client.emit('run', tooLongCode);
        });
    }

    function runHandler(done, callback) {
        var response = {
            stdout: '',
            stderr: '',
            exitCode: null
        };

        return function(data) {
            switch (data.stream) {
                case 'stdout':
                case 'stderr':
                    response[data.stream] += data.chunk;
                    break;
                case 'status':
                    response.exitCode = data.chunk;
                    callback(response);
                    done();
                    break;
                case 'error':
                    callback(data);
                    done();
            }
        };
    }
});
