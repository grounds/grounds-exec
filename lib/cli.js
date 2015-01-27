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
            console.error(err);
            exit(1);
        }
    });

    //if (!validator.isInt(program.port)) {
    //    console.log('Please specify a valid port to serve.');
    //    exit(-1);
    // certs verification
}
