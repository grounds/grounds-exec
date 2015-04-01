var rewire = require('rewire'),
    sinon = require('sinon'),
    handlers = rewire('../../lib/handlers');

var quietLogger = { log: sinon.stub(), error: sinon.stub() };

['run'].forEach(function(type) {
    var handler = rewire('../../lib/handlers/'+type);

    handler.__set__('logger', quietLogger);

    var klass = type.charAt(0).toUpperCase() + type.slice(1) + 'Handler';

    handlers.__set__(klass, handler);
});

module.exports = handlers;
