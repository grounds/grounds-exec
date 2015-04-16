var program = require('commander'),
    validator = require('validator'),
    version = require('../package.json').version,
    server = require('./server');

var error = {
    invalidPort: new Error('Invalid port.')
}

module.exports.argv = function(argv, exit) {
    program
    .version(version)
    .option('-p, --port <port>', 'Port to serve [8080]', 8080)
    .parse(argv);

    if (!validator.isNumeric(program.port) || program.port <= 0) {
        console.error(error.invalidPort);
        return exit(1);
    }
    server.listen(program.port);
}
