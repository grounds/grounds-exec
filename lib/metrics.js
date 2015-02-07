// Use newrelic if newrelic is properly configured,
// otherwise use nothing.
// With newrelic we need to create a fake web transaction,
// to have metrics for socket.io.
module.exports.add = function(event, callback) {
    if (!!process.env.NEW_RELIC_LICENSE_KEY) {
        var newrelic = require('newrelic');

        return newrelic.createWebTransaction(event, function(data) {
            callback(data);
            newrelic.endTransaction();
        });
    } else {
        return callback;
    }
}
