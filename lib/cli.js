var program = require('commander'),
    version = require('../package.json').version,
    docker = require('./docker');

module.exports.argv = function(argv, exit) {
    program
    .version(version)
    .option('-e, --endpoint <url>', 'Docker API url (must be specified)')
    .option('-r, --repository <repository>', 'Docker repository [grounds]', 'grounds')
    .option('-p, --port <port>', 'Port to serve [8080]', 8080)
    .option('-c, --certs <path>', 'Path to Docker API ssl certificates [/home/docker]', '/home/.docker')
    .parse(argv);

    docker.validate(program, function(client, err){
        if (err) {
            console.error(err.message);
            return exit(1);
        }
        client.ping(function(err) {
            if (err) {
                console.error('Docker API not responding.');
                return exit(1);
                // server listen here (port validation ?)
            }
        });
    });
}
