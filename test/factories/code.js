var FactoryGirl = require('factory_girl');

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
