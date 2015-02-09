module.exports.add = function(event, callback) {
    // Use newrelic if newrelic is properly configured,
    // otherwise use nothing.
    if (!!process.env.NEW_RELIC_LICENSE_KEY) {
        var newrelic = getNewRelic();

        // With newrelic we need to create a fake web transaction,
        // to have metrics for socket.io.
        return newrelic.createWebTransaction(event, function(data) {
            callback(data);
            newrelic.endTransaction();
        });
    } else {
        return callback;
    }
}

function getNewRelic() {
    return require('newrelic');
}
