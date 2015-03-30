var util = require('util'),
    Q = require('q'),
    utils = require('./utils'),
    streams = require('./stream'),
    docker = require('./docker'),
    EventEmitter = require('events').EventEmitter;

var maxMemory        = 80000000,
    maxSizeProgram   = 65536,
    maxExecutionTime = 10000,
    stoppedExitCode  = 137;

function Runner() {
    EventEmitter.call(this);

    this.client = docker.getClient();
    this.container = null;
}

util.inherits(Runner, EventEmitter);

Runner.prototype.create = function (args) {
    var deferred = Q.defer(),
        opts = {
            Image: utils.formatImage(this.client.repository, args.language),
            Cmd: utils.formatCmd(args.code),
            Tty: false,
            Memory: maxMemory
        },
        self = this;

    this.client.createContainer(opts, function (err, container) {
        if (err) return deferred.reject(err);

        self.container = container;
        deferred.resolve(container);
    });
    return deferred.promise;
}

Runner.prototype.get = function (info) {
    var deferred = Q.defer();

    this.container.inspect(function (err, data) {
        if (err) return deferred.reject(err);

        switch (info) {
            case 'Memory':
            case 'Image':
            case 'Cmd':
                deferred.resolve(data.Config[info]);
                break;
            case 'ExitCode':
            case 'Running':
                deferred.resolve(data.State[info]);
                break;
        }
    });
    return deferred.promise;
}

Runner.prototype._attach = function() {
    var deferred = Q.defer(),
        opts = { stream: true, stdout: true, stderr: true },
        self = this;

    this.container.attach(opts, function(err, stream) {
        if (err) return deferred.reject(err);

        var output = {
            stdout: new streams.WritableStream(),
            stderr: new streams.WritableStream()
        };
        self.container.modem.demuxStream(stream,
                                         output.stdout,
                                         output.stderr);

        ['stdout', 'stderr'].forEach(function (stream) {
            output[stream].on('data', function (data) {
                self.addOutput(stream, data);
            });
        });

        deferred.resolve(stream);
    });
    return deferred.promise;
}

Runner.prototype._start = function() {
    var deferred = Q.defer(),
        self = this;

    this.container.start(function(err, data) {
        if (err) return deferred.reject(err);

        self.emit('start');

        var id = self.container.id;

        Q.delay(maxExecutionTime)
        .then(function() {
            if (self.hasContainer(id)) {
                self.emit('timeout', maxExecutionTime);
                self.stop();
            }
        });
        deferred.resolve(data);
    });
    return deferred.promise;
}

Runner.prototype._remove = function() {
    var deferred = Q.defer(),
        self = this;

    this.container.remove(function(err, data) {
        if (err) return deferred.reject(err);

        self.container = null;
        deferred.resolve(data);
    });
    return deferred.promise;
}

Runner.prototype._wait = function() {
    var deferred = Q.defer();

    this.container.wait(function(err, data) {
        if (err) return deferred.reject(err);

        deferred.resolve(data);
    });
    return deferred.promise;
}

Runner.prototype.run = function() {
    var self = this;

    return self._attach()
    .then(function() {
        return self._start();
    })
    .then(function() {
        return self._wait();
    })
    .then(function() {
        return self.get('ExitCode');
    })
    .then(function (exitCode) {
        if (exitCode !== stoppedExitCode)
            self.emit('status', utils.formatStatus(exitCode));
        return self._remove();
    });
}

// We are not checking for stop errors, it should happend only if
// the container is already stopped.
Runner.prototype.stop = function() {
    this.container !== null && this.container.stop(function() {});
}

Runner.prototype.hasContainer = function(id) {
    return this.container && id === this.container.id;
}

Runner.prototype.addOutput = function(stream, chunk) {
    this.emit('output', { stream: stream, chunk: chunk });
};

module.exports = Runner;
