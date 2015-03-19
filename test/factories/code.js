var FactoryGirl = require('factory_girl'),
    rewire = require('rewire');

FactoryGirl.define('sleepCode', function() {
    this.stdout = 'hello world!\n';
    this.stderr = '';
    this.exitCode = 0;
    this.language = 'ruby';
    this.code = '3.times { puts "'+this.stdout+'"; sleep 5 }';
});

FactoryGirl.define('defaultCode', function() {
    this.stdout = 'hello world!\n';
    this.stderr = 'hello stderr!\n';
    this.exitCode = 1;
    this.language = 'ruby';
    this.code = 'puts "' + this.stdout +'";' +
        '$stderr.puts "'+ this.stderr+'";' +
        'exit '+this.exitCode;
});

FactoryGirl.define('tooLongCode', function() {
    this.stdout = '';
    this.stderr = '';
    this.exitCode = null;
    this.language = 'ruby';
    this.code = '';

    var maxSizeProgram = rewire('../../lib/handler/run').__get__('maxSizeProgram');

    for (var i = 0; i < maxSizeProgram + 1 ; ++i) {
        this.code = this.code + '.';
    }
});

FactoryGirl.define('undefinedCode', function() {
    this.stdout = '';
    this.stderr = '';
    this.exitCode = 0;
    this.language = 'ruby';
});
