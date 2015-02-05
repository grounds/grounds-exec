var rewire = require('rewire'),
    moment = require('moment'),
    chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    expect = chai.expect,
    logger = rewire('../../lib/logger');

chai.use(sinonChai);

describe('Logger', function() {
    before(function() {
        clock = sinon.useFakeTimers();
        date  = moment().format();
        fakeConsole = { log: sinon.stub(), error: sinon.stub() };
        revert = logger.__set__('console', fakeConsole);
    });

    after(function() {
        revert();
        clock.restore();
    });

    describe('.log()', function() {
        it('writes logs on stdout', function() {
            var msg = 'some random logs';

            logger.log(msg);

            expect(fakeConsole.log).to.have.been.calledWith(date,
                '-', msg);
        });
    });

    describe('.error()', function() {
        it('writes logs on stderr', function() {
            var msg = 'some random error';

            logger.error(msg);

            expect(fakeConsole.error).to.have.been.calledWith(date,
                '-', 'Error:', msg);
        });
    });
});
