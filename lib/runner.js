var util = require('util'),
    http = require('http'),
    utils = require('./utils'),
    streams = require('./stream'),
    EventEmitter = require('events').EventEmitter;

// Required by dockerode to attach to many containers
http.globalAgent.maxSockets = 10000;

var maxMemory        = 80000000,
    maxSizeProgram   = 65536,
    maxExecutionTime = 10000;

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
        createOpts = {
            Image: self.image,
            Cmd:   self.cmd,
            Tty:   false,
            Memory: maxMemory
        },
        attachOpts = {
            stream: true,
            stdout: true,
            stderr: true
        };

    this.client.createContainer(createOpts, function (err, container) {
        if (err) return callback(err);

        self.container = container;

        container.attach(attachOpts, function (err, stream) {
            if (err) return callback(err);

            var stdout = new streams.WritableStream(),
                stderr = new streams.WritableStream();

            container.modem.demuxStream(stream, stdout, stderr);

            stdout.on('data', function(data) { self.addOutput('stdout', data); });
            stderr.on('data', function(data) { self.addOutput('stderr', data); });

            callback();
        });
    });
}

Runner.prototype.get = function (info, callback) {
    this.container.inspect(function (err, data) {
        if (err) callback(null);

        var response = null;
        switch (info) {
            case 'Memory':
            case 'Image':
            case 'Cmd':
                response = data.Config[info];
                break;
            case 'ExitCode':
            case 'Running':
                response = data.State[info];
                break;
            case 'Stopped':
                response = data.State['ExitCode'] === 137;
        }
        callback(response);
    });
}

Runner.prototype.run = function(callback) {
    var self = this;

    this.container.start(function (err, data) {
        if (err) return callback(err);

        var containerId = self.container.id;

        self.emit('start');

        setTimeout(function() {
            if (!self.container || containerId !== self.container.id)
                return;

            self.emit('timeout', maxExecutionTime);
            self.stop();
        }, maxExecutionTime);

        self.container.wait(function() {
            self.get('Stopped', function(info) {
                var stopped = info;

                self.get('ExitCode', function(info) {
                    self.container.remove(function(err, data) {
                        if (err) return callback(err);

                        self.container = null;

                        if (!stopped)
                            self.emit('status', utils.formatStatus(info));
                        callback();
                    });;
                });
            });
        });
    });
}

Runner.prototype.stop = function() {
    this.container !== null && this.container.stop(function() {});
}

Runner.prototype.addOutput = function(stream, chunk) {
    this.emit('output', { stream: stream, chunk: chunk });
};

module.exports = Runner;
