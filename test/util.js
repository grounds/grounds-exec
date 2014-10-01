var expect = require('./spec_helper').expect,
    util = require('../lib/util');

describe('Util', function() {

    describe('.formatImage()', function() { 

        context('when a repository is specified', function() {

            it('formats image name with repository prefix', function() {
                var formated = util.formatImage('grounds', 'ruby');

                expect(formated).to.equal('grounds/exec-ruby');
            });
        });

        context('when no repository is specified', function() {

            it('formats image name without repository prefix', function() {
                expect(util.formatImage('', 'ruby')).to.equal('exec-ruby');
            });
        });

        context('when no language is specified', function() {

            it('returns an empty string', function() {
                expect(util.formatImage('grounds', '')).to.equal('');
            });
        });
    });

    describe('.formatCmd()', function() {

        it('returns an escaped string', function() {
            var code     = 'puts "Hello world\\n\\r\\t"\r\n\t',
		        expected = 'puts "Hello world\\\\n\\\\r\\\\t"\\r\\n\\t';

            expect(util.formatCmd(code)).to.equal(expected);
        });
    });

    describe('.formatStatus()', function() {

        it('returns a signed integer (range -128 to 127)', function() {
            var statusTable     = [0, 1, 128, 254, 255],
                statusExpected  = [0, 1, -128, -2, -1];

            for (var i in statusTable) {
                var formated = util.formatStatus(statusTable[i]),
                    expected = statusExpected[i];

                expect(formated).to.equal(expected);
            }
        });
    });

    describe('.formatDockerURL()', function() {

        it('returns an object with host and port splitted', function() {
            var formated = util.formatDockerURL('http://127.0.0.1:2375'),
                expected = { host: 'http://127.0.0.1', port: 2375 };

            expect(formated).to.deep.equal(expected);
        });
    });
});
