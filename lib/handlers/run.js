var moment = require('moment'),
    metrics = require('../metrics'),
    logger = require('../logger'),
    Runner = require('../runner');

var SPAM_DELAY       = 0.5, /* In seconds */
    MAX_SIZE_PROGRAM = 65536;

var error = {
    EmptyRequest: new Error('Request is empty.'),
    SpamPrevention: new Error('Spam prevention.'),
    ProgramTooLong: new Error('Program too long.'),
    TimeoutExceeded: new Error('Timeout exceeded.'),
}

function RunHandler(socket) {
    this.socket = socket;

    this.lastRequest = null;

    var self = this;
    this.socket.on('run', metrics.add('run', function(data) {
        var now         = moment(),
            lastRequest = self.lastRequest;

        if (lastRequest && lastRequest.add(SPAM_DELAY, 'second') > now)
            return self.error(error.SpamPrevention);

        self.lastRequest = now;
        self.run(data);
    }));
}

RunHandler.prototype.watch = function (runner) {
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

RunHandler.prototype.run = function(opts) {
    if (!opts) return this.error(error.EmptyRequest);

    if (!!opts.code && opts.code.length > MAX_SIZE_PROGRAM)
        return this.error(error.ProgramTooLong);

    this.stop();

    var self = this,
        runner = new Runner();

    self.watch(runner);

    return runner.run(opts)
    .fail(function (err) {
        self.error(new Error('Docker: '+err.json));
    });
}

RunHandler.prototype.stop = function() {
    if (!this.currentRunner) return;

    var runner = this.currentRunner;

    this.currentRunner = null;

    runner.removeAllListeners();
    runner.stop();

    this.reply('stop');
}

RunHandler.prototype.reply = function(stream, chunk) {
    var response = { stream: stream, chunk: chunk };

    this.socket.emit('run', response);
    logger.log('Respond to run:', response);
}

RunHandler.prototype.error = function(err) {
    this.reply('error', err.message);
}

module.exports = RunHandler;
