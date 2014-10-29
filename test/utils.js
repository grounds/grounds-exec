var rewire = require('rewire'),
    expect = require('chai').expect,
    utils = rewire('../lib/utils'),
    dockerCerts = require('./spec_helper').dockerCerts;

var fsStub = {
    readFileSync: function(path) { return path; }
};

utils.__set__('fs', fsStub);

describe('Utils', function() {
    describe('.formatImage()', function() { 
        context('when a repository is specified', function() {
            it('formats image name with repository prefix', function() {
                var formated = utils.formatImage('grounds', 'ruby');

                expect(formated).to.equal('grounds/exec-ruby');
            });
        });

        context('when no repository is specified', function() {
            it('formats image name without repository prefix', function() {
                expect(utils.formatImage('', 'ruby')).to.equal('exec-ruby');
            });
        });

        context('when no language is specified', function() {
            it('returns an empty string', function() {
                expect(utils.formatImage('grounds', '')).to.equal('');
            });
        });
    });

    describe('.formatCmd()', function() {
        it('returns an escaped string', function() {
            var code     = 'puts "Hello world\\n\\r\\t"\r\n\t',
                expected = 'puts "Hello world\\\\n\\\\r\\\\t"\\r\\n\\t';

            expect(utils.formatCmd(code)).to.equal(expected);
        });
    });

    describe('.formatStatus()', function() {
        it('returns a signed integer (range -128 to 127)', function() {
            var statusTable     = [0, 1, 128, 254, 255],
                statusExpected  = [0, 1, -128, -2, -1];

            for (var i in statusTable) {
                var formated = utils.formatStatus(statusTable[i]),
                    expected = statusExpected[i];

                expect(formated).to.equal(expected);
            }
        });
    });

    describe('.formatDockerHost()', function() {
        context('when using docker api through http', function() {
            it('returns a valid http docker host', function() {
                var dockerHost = utils.formatDockerHost('http://127.0.0.1:2375'),
                    expected   = { protocol: 'http', host: '127.0.0.1', port: 2375 };

                expect(dockerHost).to.deep.equal(expected);
            });
        });

        context('when using docker api through https', function() {
            it('returns a valid https docker host', function(){
                var dockerHost = utils.formatDockerHost('https://127.0.0.1:2376', 
                                                        dockerCerts);

                expect(dockerHost).to.satisfy(validate_https);
            });

            function validate_https(dockerHost) {
                return dockerHost.protocol === 'https' &&
                       dockerHost.host     === '127.0.0.1' &&
                       dockerHost.port     === 2376 &&
                       !!dockerHost.key  &&
                       !!dockerHost.cert &&
                       !!dockerHost.ca;
            }
        });
    });
});
