var Docker = require('dockerode'),
    FactoryGirl = require('factory_girl'),
    expect = require('chai').expect,
    util = require('../lib/util');
    
FactoryGirl.definitionFilePaths = [__dirname + '/factories'];
FactoryGirl.findDefinitions();

var dockerURL   = process.env.DOCKER_URL || 'http://127.0.0.1:2375',
    dockerHost  = util.formatDockerURL(dockerURL),
    docker      = new Docker(dockerHost);

docker.repository = 'grounds';

docker.ping(function(err, data) {
    if (err !== null) {
        console.log('Docker API not responding with docker url: %s:%s', dockerHost.host, dockerHost.port);
        process.exit(1);
    }
});

if (!!process.env.GROUNDS_EXEC_PORT)
    var socketURL = process.env.GROUNDS_EXEC_PORT.replace('tcp', 'http');
else
    var socketURL = 'http://localhost:8080';

module.exports = {
    docker: docker,
    expect: expect,
    socketURL: socketURL,
    FactoryGirl: FactoryGirl
};
