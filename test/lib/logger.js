var rewire = require('rewire'),
    moment = require('moment'),
    sinon  = require('sinon'),
    expect = require('chai').expect,
    logger = rewire('../../lib/logger');

logger.__set__({
    console: {
        log: sinon.stub(),
        error: sinon.stub()
    }
});

var loggerConsole = logger.__get__('console'),
    clock;

describe('Logger', function() {
    before(function () {
        clock = sinon.useFakeTimers();
        date  = moment().format();
        separator = '-';
    });

    after(function ()  { clock.restore(); });

    describe('.log()', function() {
        it('writes logs on stdout', function() {
            var msg = 'some random logs',
                matcher = sinon.match(date, separator, msg);

            logger.log(msg);

            sinon.assert.calledWith(loggerConsole.log, date, separator, msg);
        });
    });

    describe('.error()', function() {
        it('writes logs on stderr', function() {
            var msg = 'some random error',
                matcher = sinon.match(date, separator, msg);

            logger.error(msg);

            sinon.assert.calledWith(loggerConsole.error, date,
                separator, 'Error:', msg);
        });
    });
});
