var rewire = require('rewire'),
    expect = require('chai').expect,
    path = require('path'),
    utils = rewire('../../lib/utils');

utils.__set__('fs', { readFileSync: function(path) { return path; } });

var IMAGE_PREFIX = utils.__get__('IMAGE_PREFIX');

describe('Utils', function() {
    describe('.formatImage()', function() {
        context('when a repository is specified', function() {
            beforeEach(function() {
                language = 'ruby';
                formated = utils.formatImage('grounds', language);
            });

            it('formats image name with repository prefix', function() {
                expect(formated).to.equal('grounds/'+IMAGE_PREFIX+'-'+language);
            });
        });

        context('when no repository is specified', function() {
            beforeEach(function() {
                language = 'java';
                formated = utils.formatImage('', language);
            });

            it('formats image name without repository prefix', function() {
                expect(formated).to.equal(IMAGE_PREFIX+'-'+language);
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
});
