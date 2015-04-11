var rewire = require('rewire'),
    expect = require('chai').expect,
    path = require('path'),
    utils = rewire('../../lib/utils');

utils.__set__('fs', { readFileSync: function(path) { return path; } });

var IMAGE_PREFIX = utils.__get__('IMAGE_PREFIX');

describe('Utils', function() {
    describe('.formatImage()', function() {
        context('when a repository is specified', function() {
            var language = 'ruby',
                tag = 'latest',
                formated = utils.formatImage('grounds', language, tag);

            it('formats image name with repository prefix', function() {
                var expected = 'grounds/'+IMAGE_PREFIX+'-'+language+':'+tag;

                expect(formated).to.equal(expected);
            });
        });

        context('when no repository is specified', function() {
            var language = 'java',
                tag      = '1.0.0',
                formated = utils.formatImage('', language, tag);

            it('formats image name without repository prefix', function() {
                expect(formated).to.equal(IMAGE_PREFIX+'-'+language+':'+tag);
            });
        });

        context('when no language is specified', function() {
            it("doesn't fail", function() {
                expect(function() {
                    utils.formatImage('grounds');
                }).not.to.throw(Error);
            });
        });

        context('when no tag is specified', function() {
            it("doesn't fail", function() {
                expect(function() {
                    utils.formatImage('grounds', 'ruby');
                }).not.to.throw(Error);
            });
        });
    });

    describe('.formatCmd()', function() {
        var formated = utils.formatCmd('puts "Hello world\\n\\r\\t"\r\n\t');

        it('returns an escaped string', function() {
            var escapedString = 'puts "Hello world\\\\n\\\\r\\\\t"\\r\\n\\t';

            expect(formated).to.equal(escapedString);
        });

        context('when code is not specified', function() {
            var formated = utils.formatCmd();

            it('returns an empty string', function() {
                expect(formated).to.equal('');
            });
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
});
