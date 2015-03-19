var rewire = require('rewire'),
    expect = require('chai').expect,
    path = require('path'),
    utils = rewire('../../lib/utils');

utils.__set__('fs', { readFileSync: function(path) { return path; } });

describe('Utils', function() {
    describe('.formatImage()', function() {
        context('when a repository is specified', function() {
            beforeEach(function() {
                formated = utils.formatImage('grounds', 'ruby');
            });

            it('formats image name with repository prefix', function() {
                expect(formated).to.equal('grounds/exec-ruby');
            });
        });

        context('when no repository is specified', function() {
            beforeEach(function() {
                formated = utils.formatImage('', 'java');
            });

            it('formats image name without repository prefix', function() {
                expect(formated).to.equal('exec-java');
            });
        });

        context('when no language is specified', function() {
            beforeEach(function() {
                formated = utils.formatImage('grounds', '');
            });
            expectEmptyString();
        });
    });

    describe('.formatCmd()', function() {
        beforeEach(function() {
            formated = utils.formatCmd('puts "Hello world\\n\\r\\t"\r\n\t');
        });

        it('returns an escaped string', function() {
            var escapedString = 'puts "Hello world\\\\n\\\\r\\\\t"\\r\\n\\t';

            expect(formated).to.equal(escapedString);
        });

        context('when code is not specified', function() {
            beforeEach(function() {
                formated = utils.formatCmd();
            });
            expectEmptyString();
        });
    });

    function expectEmptyString() {
        it('returns an empty string', function() {
            expect(formated).to.equal('');
        });
    }

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
            beforeEach(function() {
                dockerHost = utils.formatDockerHost('http://127.0.0.1:2375');
            });

            it('returns a valid http docker host', function() {
                var expected = { protocol: 'http', host: '127.0.0.1', port: 2375 };

                expect(dockerHost).to.deep.equal(expected);
            });
        });

        context('when using docker api through https', function() {
            var endpointHTTPS = 'https://127.0.0.1:2376',
                certsFiles = {
                    key: 'key',
                    cert: 'cert',
                    ca: 'ca'
            };

            beforeEach(function() {
                dockerHost = utils.formatDockerHost(endpointHTTPS,
                                                    certsFiles);
            });

            expectDockerHostWith('protocol', 'https');
            expectDockerHostWith('host', '127.0.0.1');
            expectDockerHostWith('port', 2376);
            expectDockerHostWith('key', certsFiles.key);
            expectDockerHostWith('cert', certsFiles.cert);
            expectDockerHostWith('ca', certsFiles.ca);

            function expectDockerHostWith(key, value) {
                it('returns a docker host with '+key+': '+value, function() {
                    expect(dockerHost[key]).to.eq(value);
                });
            }
        });
    });

     describe('.formatCertsFiles()', function() {
        context('with empty path', function() {
            beforeEach(function() {
                certsFiles = utils.formatCertsFiles();
            });

            it('returns null', function() {
                expect(certsFiles).to.be.null;
            });
        });

        context('with a path', function() {
            beforeEach(function() {
                certsPath  = 'test';
                certsFiles = utils.formatCertsFiles(certsPath);
            });

            ['key', 'cert', 'ca'].forEach(function(file) {
                expectFormatedFile(file);
            });
        });

        function expectFormatedFile(name) {
            it('returns an objet with '+name+' certificate path', function() {
                var expected = path.resolve(certsPath, name+'.pem');

                expect(certsFiles[name]).to.eq(expected);
            });
        }
     });
});
