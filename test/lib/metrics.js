var rewire = require('rewire'),
    moment = require('moment'),
    chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    expect = chai.expect,
    metrics = rewire('../../lib/metrics');

chai.use(sinonChai);

describe('Metrics', function() {
    describe('.add()', function() {
        context('when newrelic license key is set', function() {
            var event = 'run',
                callback, newCallback, revertFakeLicenseKey, revertNewRelic;

            beforeEach(function() {
                useFakeLicenseKey();
                callback = sinon.stub();
            });

            afterEach(function() {
                revertFakeLicenseKey();
            });

            it('returns a different callback than the original one', function() {
                newCallback = metrics.add(event, callback);

                expect(newCallback).not.to.equal(callback);
            });

            it('returns a callback encapsulating the original one', function() {
                var data = 'test';

                newCallback = metrics.add(event, callback);

                // We must first verify that we are not getting the original one.
                if (newCallback !== callback)
                    newCallback(data);

                expect(callback).to.have.been.calledWith(data);
            });

            it('creates a newrelic web transaction with event specified', function() {
                fakeNewRelic = { createWebTransaction: sinon.stub() };

                useFakeNewRelic();

                newCallback = metrics.add(event, callback);

                expect(fakeNewRelic.createWebTransaction).to.have.been
                    .calledWith(event);

                revertNewRelic();
            });

            it('ends newrelic web transaction after callback', function() {
                fakeNewRelic = { createWebTransaction: function(event, callback) {
                    callback();
                }, endTransaction: sinon.stub() };

                useFakeNewRelic();

                newCallback = metrics.add(event, callback);

                expect(fakeNewRelic.endTransaction).to.have.been
                    .calledAfter(callback);

                revertNewRelic();
            });

            // Hopefully, newrelics module doesn't fail with
            // a fake license key, this is very convenient to have
            // this test working in multiple environments.
            function useFakeLicenseKey() {
                var envVar = 'process.env.NEW_RELIC_LICENSE_KEY';

                revertFakeLicenseKey = metrics.__set__(envVar, '42');
            }

            function useFakeNewRelic() {
                revertNewRelic = metrics.__set__('getNewRelic', function() {
                    return fakeNewRelic;
                });
            }
        });

        context('without newrelic license key', function() {
            var event = 'test',
                callback, newCallback;

            beforeEach(function() {
                callback = function() {};
                newCallback = metrics.add(event, callback);
            });

            it('returns the original callback', function() {
                expect(newCallback).to.equal(callback);
            });
        });
    });
});
