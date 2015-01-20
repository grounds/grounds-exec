var rewire = require('rewire'),
    moment = require('moment'),
    chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    expect = chai.expect,
    logger = rewire('../../lib/logger');

chai.use(sinonChai);

var loggerConsole = {
    log: sinon.stub(),
    error: sinon.stub()
}

logger.__set__({ console: loggerConsole });

describe('Logger', function() {
    before(function () {
        clock = sinon.useFakeTimers();
        date  = moment().format();
    });

    after(function ()  { clock.restore(); });

    describe('.log()', function() {
        it('writes logs on stdout', function() {
            var msg = 'some random logs';

            logger.log(msg);

            expect(loggerConsole.log).to.have.been.calledWith(date,
                '-', msg);
        });
    });

    describe('.error()', function() {
        it('writes logs on stderr', function() {
            var msg = 'some random error';

            logger.error(msg);

            expect(loggerConsole.error).to.have.been.calledWith(date,
                '-', 'Error:', msg);
        });
    });
});
