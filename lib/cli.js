var version = require('../package.json').version,
    docker = require('./docker'),
    program = require('commander');

module.exports.argv = function(argv) {
    program
    .version(version)
    .option('-e, --endpoint <url>', 'Docker API url (must be specified)')
    .option('-r, --repository <repository>', 'Docker repository [grounds]', 'grounds')
    .option('-p, --port <port>', 'Port to serve [8080]', 8080)
    .option('-c, --cert <path>', 'Path to ssl certificates [/home/docker]', '/home/.docker')
    .parse(argv);

    var dockerClient = docker.getClient(program.endpoint,
                                        program.certs,
                                        program.repository);

    // Should quit if docker cli not responding
}
