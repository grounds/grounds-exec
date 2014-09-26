var expect = require('./spec_helper').expect,
    util = require('../lib/util');

describe('Util', function() {

    describe('.formatImage', function() { 

        describe('when a repository is specified', function() {

            it('formats image name with repository prefix', function(done) {
                var formated = util.formatImage('grounds', 'ruby');

                expect(formated).to.equal('grounds/exec-ruby');
                done();
            });
        });

        describe('when no repository is specified', function() {

            it('formats image name without repository prefix', function(done) {
                expect(util.formatImage('', 'ruby')).to.equal('exec-ruby');
                done();
            });
        });

        describe('when no language is specified', function() {

            it('returns an empty string', function(done) {
                expect(util.formatImage('grounds', '')).to.equal('');
                done();
            });
        });
    });

    describe('.formatCmd', function() {

        it('returns an escaped string', function(done) {
            var code     = 'puts "Hello world\\n\\r\\t"\r\n\t',
		expected = 'puts "Hello world\\\\n\\\\r\\\\t"\\r\\n\\t';

            expect(util.formatCmd(code)).to.equal(expected);
            done();
        });
    });

    describe('.formatStatus', function() {

        it('returns a signed integer (range -128 to 127)', function(done) {
            var statusTable     = [0, 1, 128, 254, 255],
                statusExpected  = [0, 1, -128, -2, -1];

            for (var i in statusTable) {
                var formated = util.formatStatus(statusTable[i]),
                    expected = statusExpected[i];

                expect(formated).to.equal(expected);
            }
            done();
        });
    });

    describe('.formatDockerURL', function() {

        it('returns an hash with host and port splitted', function(done) {
            var formated = util.formatDockerURL('http://127.0.0.1:2375'),
                expected = { host: 'http://127.0.0.1', port: 2375 };

            expect(formated).to.deep.equal(expected);
            done();
        });
    });
});
