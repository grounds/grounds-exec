var Docker = require('dockerode'),
    FactoryGirl = require('factory_girl'),
    utils = require('../lib/utils');

FactoryGirl.definitionFilePaths = [__dirname + '/factories'];
FactoryGirl.findDefinitions();

var docker = new Docker();;

docker.repository = process.env.REPOSITORY || 'grounds';

docker.ping(function(err) {
    if (err) {
        console.log('Docker %s', err);
        process.exit(1);
    }
});

module.exports = {
    docker: docker,
    FactoryGirl: FactoryGirl,
};
