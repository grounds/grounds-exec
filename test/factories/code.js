var FactoryGirl = require('factory_girl');

FactoryGirl.define('stdoutExample', function() {
    this.language = 'python2';
    this.code = 'print 42';

    this.input = { language: this.language, code: this.code };
    this.output = [
        { stream: 'start',  chunk: '' },
        { stream: 'stdout', chunk: '42\n' },
        { stream: 'status', chunk: 0 }
    ];
})

FactoryGirl.define('stderrExample', function() {
    this.language = 'python2';
    this.code = 'a'; // Will produce an error from the python2 interpreter
})

FactoryGirl.define('sleepExample', function() {
    this.language = 'ruby';
    this.code = '3.times { puts "lol" sleep 5 }';
})