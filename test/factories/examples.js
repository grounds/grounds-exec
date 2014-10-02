var fs = require('fs'),
    path = require('path'),
    FactoryGirl = require('factory_girl');

var languages = ['c', 'cpp', 'csharp', 'golang', 'python2', 'python3', 'ruby'];

function loadExamples() {
    var examples = [],
        outputs  = [];

    // Read output files
    var dirPath = path.resolve(__dirname, '../../examples/output'),
        files   = fs.readdirSync(dirPath);

    for (var i in files) {
        var filePath = path.resolve(dirPath, files[i]),
            output   = fs.readFileSync(filePath).toString();
        
        outputs.push(output);
    }
    
    // Read code files
    languages.forEach(function(language) {
        dirPath = path.resolve(__dirname, '../../examples/code', language);
        files   = fs.readdirSync(dirPath);

        for (var i in files) {
            filePath = path.resolve(dirPath, files[i]);

            var code = fs.readFileSync(filePath).toString(),
                example = { language: language, code: code, output: outputs[i]};

            examples.push(example);
        }
    });
    return examples;
}

FactoryGirl.define('examples', function() {
    this.list = loadExamples();
});