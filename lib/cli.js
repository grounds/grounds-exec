var program = require('commander'),
//    validator = require('validator'),
    version = require('../package.json').version,
    docker = require('./docker');

module.exports.argv = function(argv, exit) {
    program
    .version(version)
    .option('-e, --endpoint <url>', 'Docker API url (must be specified)')
    .option('-r, --repository <repository>', 'Docker repository [grounds]', 'grounds')
    .option('-p, --port <port>', 'Port to serve [8080]', 8080)
    .option('-c, --certs <path>', 'Path to ssl certificates [/home/docker]', '/home/.docker')
    .parse(argv);

   // if (!validator.isURL(program.endpoint)) {
    //    console.log('Please specify a valid Docker endpoint.');
     //   exit(-1);
    //}
    /*if (!validator.isAlphanumeric(program.repository)) {*/
        //console.log('Please specify a valid Docker repository.');
        //exit(-1);
    /*};*/
    var dockerClient = docker.getClient(program.endpoint,
                                        program.certs,
                                        program.repository);

    //if (!validator.isInt(program.port)) {
    //    console.log('Please specify a valid port to serve.');
    //    exit(-1);
    }
    // certs verification
}
