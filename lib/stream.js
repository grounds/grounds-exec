var util = require('util'),
    EventEmitter = require('events').EventEmitter;

function WritableStream() {
    EventEmitter.call(this);
}

util.inherits(WritableStream, EventEmitter);

WritableStream.prototype.write = function(data) {
    var str = String.fromCharCode.apply(String, data);

    this.emit('data', str);
}

module.exports.WritableStream = WritableStream;
