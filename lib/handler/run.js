var moment = require('moment'),
    metrics = require('../metrics'),
    logger = require('../logger'),
    Runner = require('../runner');

// Spam delay prevention in seconds
var spamDelay = 0.5;

function Run(socket, docker) {
    this.socket = socket;
    this.docker = docker;
    this.lastRequest = null;

    var self = this;
    this.socket.on('run', metrics.add('run', function(data) {
        var now         = moment(),
            lastRequest = self.lastRequest;

        self.lastRequest = now;

        if (lastRequest && lastRequest.add(spamDelay, 'second') > now)
            return self.error('Spam prevention.');

        self.run(data);
    }));
}

Run.prototype.run = function(data) {
    if (!data) return this.error('Empty request.');

    this.stop();

    var self   = this,
        runner = new Runner(this.docker, data.language, data.code);

    runner.on('output', function(output) {
        self.reply(output);
    }).on('status', function(status) {
        self.reply({ stream: 'status', chunk: status });
    }).on('timeout', function(err) {
        self.error('Timeout exceeded.');
    }).on('start', function() {
        self.reply({ stream: 'start', chunk: moment()._d });
    });;

    runner.create(function(err) {
        if (err) return self.error('Docker error.');

        self.currentRunner = runner;

        runner.run(function(err) {
            if (err) return self.error('Docker error.');
        });
    });
}

Run.prototype.stop = function() {
    if (!this.currentRunner) return;

    var runner = this.currentRunner;

    this.currentRunner = null;

    runner.removeAllListeners();
    runner.stop();

    this.reply({ stream: 'stop', chunk: moment()._d });
}

Run.prototype.reply = function(data) {
    this.socket.emit('run', data);
    logger.log('Respond to run:', data);
}

Run.prototype.error = function(err) {
    this.reply({ stream: 'error', chunk: err });
}

module.exports = Run;
