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
}

util.inherits(Runner, EventEmitter);

Runner.prototype.create = function (callback) {
    var self = this,
        createOpts = { Image: this.image, Cmd: this.cmd, Tty: false, Memory: maxMemory },
        attachOpts = { stream: true, stdout: true, stderr: true };

    var createContainer = Q.nbind(this.client.createContainer, this.client);

    return createContainer(createOpts)
    .then(function (container) {
        self.container = container;

        var attachContainer = Q.nbind(container.attach, container);

        return attachContainer(attachOpts)
        .then(function(stream) {
            var stdout = new streams.WritableStream(),
                stderr = new streams.WritableStream();

            container.modem.demuxStream(stream, stdout, stderr);

            stdout.on('data', function(data) { self.addOutput('stdout', data); });
            stderr.on('data', function(data) { self.addOutput('stderr', data); });

            callback(null);
        }, function (err) {
            callback(err);
        });
    }, function (err) {
        callback(err);
    });
}

Runner.prototype.get = function (info) {
    var deferred = Q.defer();

    this.container.inspect(function(err, data) {
        if (err) {
            deferred.reject(new Error(err));
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

Runner.prototype.run = function(callback) {
    var self = this;

    var containerStart  = Q.nbind(this.container.start, this.container),
        containerWait   = Q.nbind(this.container.wait, this.container),
        containerRemove = Q.nbind(this.container.remove, this.container);

    return containerStart()
    .then(function () {
        self.emit('start');
        return self.container.id;
    })
    .then(function (containerId) {
        Q.delay(maxExecutionTime)
        .then(function() {
            if (self.hasContainer(containerId)) {
                self.emit('timeout', maxExecutionTime);
                self.stop();
            }
        });

        return containerWait()
        .then(function() {
            return self.get('ExitCode');
        })
        .then(function(exitCode) {
            return containerRemove()
            .then(function() {
                self.container = null;

                if (exitCode !== stoppedExitCode)
                    self.emit('status', utils.formatStatus(exitCode));

                callback(null);
            }, function (err) {
                callback(err);
            });
        }, function (err) {
            callback(err);
        });
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
