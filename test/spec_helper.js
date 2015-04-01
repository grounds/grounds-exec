var FactoryGirl = require('factory_girl');

FactoryGirl.definitionFilePaths = [__dirname + '/factories'];
FactoryGirl.findDefinitions();

module.exports = { Factory: FactoryGirl };
