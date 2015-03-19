var moment = require('moment'),
    metrics = require('../metrics'),
    logger = require('../logger'),
    Runner = require('../runner');

// Spam delay prevention in seconds
var spamDelay      = 0.5,
    maxSizeProgram = 65536;

var error = {
    EmptyRequest: new Error('Request is empty.'),
    SpamPrevention: new Error('Spam prevention.'),
    ProgramTooLong: new Error('Program too long.'),
    TimeoutExceeded: new Error('Timeout exceeded.')
}

function Run(socket, docker) {
    this.socket = socket;
    this.docker = docker;
    this.lastRequest = null;

    var self = this;
    this.socket.on('run', metrics.add('run', function(data) {
        var now         = moment(),
            lastRequest = self.lastRequest;

        if (lastRequest && lastRequest.add(spamDelay, 'second') > now)
            return self.error(error.SpamPrevention);

        self.lastRequest = now;
        self.run(data);
    }));
}

Run.prototype.watch = function (runner) {
    var self = this;

    this.currentRunner = runner;

    runner.on('output', function(output) {
        self.reply(output.stream, output.chunk);
    }).on('status', function(status) {
        self.reply('status', status);
    }).on('timeout', function(err) {
        self.error(error.TimeoutExceeded);
    }).on('start', function() {
        self.reply('start');
    });
}

Run.prototype.run = function(opts) {
    if (!opts) return this.error(error.EmptyRequest);

    if (typeof(opts.code) !== 'undefined' && opts.code.length > maxSizeProgram)
        return this.error(error.ProgramTooLong);

    this.stop();

    var self = this,
        runner = new Runner(this.docker);

    return runner.create(opts)
    .then(function() {
        self.watch(runner);
        return runner.run();
    })
    .fail(function (err) {
        self.error(new Error('Docker: '+err.json));
    });
}

Run.prototype.stop = function() {
    if (!this.currentRunner) return;

    var runner = this.currentRunner;

    this.currentRunner = null;

    runner.removeAllListeners();
    runner.stop();

    this.reply('stop');
}

Run.prototype.reply = function(stream, chunk) {
    var response = { stream: stream, chunk: chunk };

    this.socket.emit('run', response);
    logger.log('Respond to run:', response);
}

Run.prototype.error = function(err) {
    this.reply('error', err.message);
}

module.exports = Run;
