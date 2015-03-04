var FactoryGirl = require('factory_girl');

FactoryGirl.define('sleepCode', function() {
    this.language = 'ruby';
    this.code = '3.times { puts "lol" sleep 5 }';
});

FactoryGirl.define('stdoutCode', function() {
    this.language = 'python2';
    this.code = 'print 42';

    this.input = { language: this.language, code: this.code };
    this.output = [
        { stream: 'start',  chunk: '' },
        { stream: 'stdout', chunk: '42\n' },
        { stream: 'status', chunk: 0 }
    ];
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
