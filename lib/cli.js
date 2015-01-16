var version = require('../package.json').version,
    program = require('commander');

module.exports = function(argv) {
    program
    .version(version)
    .option('-e, --endpoint [url]', 'Docker API url')
    .option('-r, --repository [name])', 'Docker repository', 'grounds')
    .option('-p, --port [number]', 'Port to serve', 8080)
    .option('-c, --certs [path]', 'Path to ssl certificates', '/home/.docker')
    .parse(argv);
    return program;
}
