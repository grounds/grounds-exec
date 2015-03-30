var util = require('util'),
    Q = require('q'),
    utils = require('./utils'),
    streams = require('./stream'),
    docker = require('./docker'),
    EventEmitter = require('events').EventEmitter;

var MAX_MEMORY         = 80000000,
    MAX_EXECUTION_TIME = 10000,
    STOPPED_EXIT_CODE  = 137;

function Runner() {
    EventEmitter.call(this);

    this.client = docker.getClient();
    this.container = null;
}

util.inherits(Runner, EventEmitter);

Runner.prototype.run = function(args) {
    var self = this;

    return self._createContainer(args)
    .then(function() {
        return self._attachContainer();
    })
    .then(function() {
        return self._startContainer();
    })
    .then(function() {
        return self._waitContainer();
    })
    .then(function() {
        return self._getContainer('ExitCode');
    })
    .then(function (exitCode) {
        if (exitCode !== STOPPED_EXIT_CODE)
            self.emit('status', utils.formatStatus(exitCode));
        return self._removeContainer();
    });
}

// We are not checking for stop errors, it should happend only if
// the container is already stopped.
Runner.prototype.stop = function() {
    this.container !== null && this.container.stop(function() {});
}

Runner.prototype._hasContainer = function(id) {
    return this.container && id === this.container.id;
}

Runner.prototype._addOutput = function(stream, chunk) {
    this.emit('output', { stream: stream, chunk: chunk });
};

Runner.prototype._createContainer = function (args) {
    var deferred = Q.defer(),
        opts = {
            Image: utils.formatImage(this.client.repository, args.language),
            Cmd: utils.formatCmd(args.code),
            Tty: false,
            Memory: MAX_MEMORY
        },
        self = this;

    this.client.createContainer(opts, function (err, container) {
        if (err) return deferred.reject(err);

        self.container = container;
        self.emit('created', container);
        deferred.resolve(container);
    });
    return deferred.promise;
}

Runner.prototype._getContainer = function (info) {
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

Runner.prototype._attachContainer = function() {
    var deferred = Q.defer(),
        opts = { stream: true, stdout: true, stderr: true },
        self = this;

    this.container.attach(opts, function(err, stream) {
        if (err) return deferred.reject(err);

        var output = {
            stdout: new streams.WritableStream(),
            stderr: new streams.WritableStream()
        };
        self.container.modem.demuxStream(
            stream,
            output.stdout,
            output.stderr
        );

        ['stdout', 'stderr'].forEach(function (stream) {
            output[stream].on('data', function (data) {
                self._addOutput(stream, data);
            });
        });

        deferred.resolve(stream);
    });
    return deferred.promise;
}

Runner.prototype._startContainer = function() {
    var deferred = Q.defer(),
        self = this;

    this.container.start(function(err, data) {
        if (err) return deferred.reject(err);

        self.emit('start');

        var id = self.container.id;

        Q.delay(MAX_EXECUTION_TIME)
        .then(function() {
            if (self._hasContainer(id)) {
                self.emit('timeout', MAX_EXECUTION_TIME);
                self.stop();
            }
        });
        deferred.resolve(data);
    });
    return deferred.promise;
}

Runner.prototype._removeContainer = function() {
    var deferred = Q.defer(),
        self = this;

    this.container.remove(function(err, data) {
        if (err) return deferred.reject(err);

        self.container = null;
        deferred.resolve(data);
    });
    return deferred.promise;
}

Runner.prototype._waitContainer = function() {
    var deferred = Q.defer();

    this.container.wait(function(err, data) {
        if (err) return deferred.reject(err);

        deferred.resolve(data);
    });
    return deferred.promise;
}

module.exports = Runner;
