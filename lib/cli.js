var version = require('../package.json').version,
    docker = require('./docker'),
    program = require('commander');

module.exports.argv = function(argv) {
    program
    .version(version)
    .option('-e, --endpoint [url]', 'Docker API url')
    .option('-r, --repository [name])', 'Docker repository', 'grounds')
    .option('-p, --port [number]', 'Port to serve', 8080)
    .option('-c, --certs [path]', 'Path to ssl certificates', '/home/.docker')
    .parse(argv);

    var dockerClient = docker.getClient(program.endpoint,
                                        program.certs,
                                        program.repository);

    // Should quit if docker cli not responding
}
