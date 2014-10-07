var util = require('util'),
    http = require('http'),
    utils = require('./util'),
    stream = require('./stream'),
    EventEmitter = require('events').EventEmitter;

// Required by dockerode to attach to many containers
http.globalAgent.maxSockets = 10000;

var containerOpts  = { Tty: false, Memory: 64000000 },
    maxSizeProgram = 65536,
    runTimeout     = 10000;

function Runner(docker) {
    EventEmitter.call(this);
    
    this._docker = docker;
    this._container = null;
    this._runTimeout = runTimeout;
    this.state = 'idle';
}

util.inherits(Runner, EventEmitter);

Runner.prototype.run = function (language, code) {
    var image = utils.formatImage(this._docker.repository, language), 
        cmd   = utils.formatCmd(code);

    if (!image) 
        return this.error("Please specify a valid language.");
    
    if (cmd.length > maxSizeProgram)
        return this.error("Program too large.");
    
    var self   = this,
        stdout = new stream.WritableStream(),
        stderr = new stream.WritableStream();

    stdout.on('data', function(data) {
        self.write("stdout", data);
    });

    stderr.on('data', function(data) {
        self.write("stderr", data);
    });
        
    this._docker.run(image, cmd, [stdout, stderr], containerOpts, function(err, data, container) {
        if (err) return self.error(err);
      
        container.remove(function(err, data) {
            if (err)
                return self.error(err);
        });
        if (self.state === 'timeout') return;

        var status = utils.formatStatus(data.StatusCode);

        self.state = 'finished';
        self.write('status', status);

    }).on('container', function(container) {
        if (!container) return;

        self._container = container;
        self.write('start', '');

        setTimeout(function() {
            if (self.state === 'finished') return;

            self.state = 'timeout';
            self.stop();
            self.error('Timeout exceeded.');
        }, self._runTimeout);
    });;
};

Runner.prototype.stop = function() {
    if (this._container) return;

    this._container.stop(function(err, data) { }); 
};

Runner.prototype.write = function(stream, chunk) {
    this.emit('output', { stream: stream, chunk: chunk });
};

Runner.prototype.error = function(error) {
    this.write('error', error);
};

module.exports = Runner;
module.exports.maxSizeProgram = maxSizeProgram;
module.exports.runTimeout = runTimeout;
