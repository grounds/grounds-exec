var rewire = require('rewire'),
    runHandler = rewire('../../lib/handlers/run');

var MAX_SIZE_PROGRAM = runHandler.__get__('MAX_SIZE_PROGRAM');

module.exports.Default() = function() {
    this.stdout = 'hello world!\n';
    this.stderr = 'hello stderr!\n';
    this.exitCode = 1;
    this.language = 'ruby';
    this.code = 'puts "' + this.stdout +'";' +
        '$stderr.puts "'+ this.stderr+'";' +
        'exit '+this.exitCode;
}

module.exports.Sleep() = function() {
    this.stdout = 'hello world!\n';
    this.stderr = '';
    this.exitCode = 0;
    this.language = 'ruby';
    this.code = '3.times { puts "'+this.stdout+'"; sleep 5 }';
}

module.exports.TooLong() = function() {
    this.stdout = '';
    this.stderr = '';
    this.exitCode = null;
    this.language = 'ruby';
    this.code = '';

    for (var i = 0; i < MAX_SIZE_PROGRAM + 1 ; ++i) {
        this.code = this.code + '.';
    }
}

module.exports.Undefined = function() {
    this.stdout = '';
    this.stderr = '';
    this.exitCode = 0;
    this.language = 'ruby';
}