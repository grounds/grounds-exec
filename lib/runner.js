var util = require('util'),
    http = require('http'),
    Q = require('q'),
    utils = require('./utils'),
    streams = require('./stream'),
    EventEmitter = require('events').EventEmitter;

// Required by dockerode to attach to many containers
http.globalAgent.maxSockets = 10000;

var maxMemory        = 80000000,
    maxSizeProgram   = 65536,
    maxExecutionTime = 10000,
    stoppedExitCode  = 137;

function Runner(client, language, code) {
    EventEmitter.call(this);

    this.client = client;
    this.image  = utils.formatImage(client.repository, language);
    this.cmd    = utils.formatCmd(code);
    this.container = null;
    this.stdout    = new streams.WritableStream();
    this.stderr    = new streams.WritableStream();
}

util.inherits(Runner, EventEmitter);

Runner.prototype.create = function (callback) {
    var opts = {
            Image: this.image,
            Cmd: this.cmd,
            Tty: false,
            Memory: maxMemory
        },
        self = this;

    var createContainer = Q.nbind(this.client.createContainer, this.client);

    return createContainer(opts)
    .then(function (container) {
        self.container = container;

        callback();
    }, function (err) {
        callback(err);
    });
}

Runner.prototype.get = function (info) {
    var deferred = Q.defer();

    this.container.inspect(function(err, data) {
        if (err) {
            deferred.reject(err);
        } else {
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
        }
    });
    return deferred.promise;
}

Runner.prototype.attach = function() {
    var deferred = Q.defer(),
        opts = { stream: true, stdout: true, stderr: true };

    this.container.attach(opts, function(err, stream) {
        if (err)
            deferred.reject(err);
        else
            deferred.resolve(stream);
    });
    return deferred.promise;
}

Runner.prototype.start = function() {
    var deferred = Q.defer();

    this.container.start(function(err, data) {
        if (err)
            deferred.reject(err);
        else
            deferred.resolve(data);
    });
    return deferred.promise;
}

Runner.prototype.remove = function() {
    var deferred = Q.defer();

    this.container.remove(function(err, data) {
        if (err)
            deferred.reject(err);
        else
            deferred.resolve(data);
    });
    return deferred.promise;
}

Runner.prototype.wait = function() {
    var deferred = Q.defer();

    this.container.wait(function(err, data) {
        if (err)
            deferred.reject(err);
        else
            deferred.resolve(data);
    });
    return deferred.promise;
}

Runner.prototype.run = function(callback) {
    var self = this;

    return self.attach()
    .then(function (stream) {
        self.container.modem.demuxStream(stream, self.stdout, self.stderr);

        self.stdout.on('data', function(data) { self.addOutput('stdout', data); });
        self.stderr.on('data', function(data) { self.addOutput('stderr', data); });

        return self.start();
    })
    .then(function () {
        self.emit('start');

        var containerId = self.container.id;

        Q.delay(maxExecutionTime)
        .then(function() {
            if (self.hasContainer(containerId)) {
                self.emit('timeout', maxExecutionTime);
                self.stop();
            }
        });
        return self.wait();
    })
    .then(function () {
        return self.get('ExitCode');
    })
    .then(function (exitCode) {
        if (exitCode !== stoppedExitCode)
            self.emit('status', utils.formatStatus(exitCode));
        return self.remove();
    })
    .then(function () {
        self.container = null;

        callback(null);
    }, function (err) {
        callback(err);
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
