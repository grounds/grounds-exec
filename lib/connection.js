var moment = require('moment'),
    metrics = require('./metrics'),
    logger = require('./logger'),
    Runner = require('./runner');

// Spam delay prevention in seconds
var spamDelay = 0.5;

function Connection(socket, docker) {
    this.socket = socket;
    this.docker = docker;
    this.currentRunner = null;
    this.lastRunAt = null;

    this.listen();
}

Connection.prototype.listen = function() {
    var self = this;

    this.socket.on('run', metrics.add('run', function(data) {
        var now            = moment(),
            lastRunAt      = self.lastRunAt;

        self.lastRunAt = now;

        if (lastRunAt && lastRunAt.add(spamDelay, 'second') > now)
            return self.reply('run', { stream: 'error', chunk: 'Spam prevention.' });

        self.run(data);
    }));
};

Connection.prototype.run = function(data) {
    if (!data) return this.reply('run', { stream: 'error', chunk: 'Empty request.'});

    if (this.currentRunner) {
        // Move to runner ?
        this.currentRunner.removeAllListeners();
        this.currentRunner.stop();
    }

    var self   = this,
        runner = new Runner(this.docker, data.language, data.code);

    runner.on('output', function(output) {
        self.reply('run', output);
    }).on('status', function(status) {
        self.reply('run', { stream: 'status', chunk: status });
    });

    runner.create(function(err) {
        if (err) {
            logger.error(err);
            return self.reply('run', { stream: 'error', chunk: 'Docker error.' });
        }

        self.currentRunner = runner;

        runner.run(function(err) {
            if (err) {
                logger.error(err);
                return self.reply('run', { stream: 'error', chunk: 'Docker error.' });
            }
        });
    });
}

Connection.prototype.reply = function(event, data) {
    this.socket.emit(event, data);
    logger.log('Respond :', event, data);
}

module.exports = Connection;
