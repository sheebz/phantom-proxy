var should = require("should"),
    assert = require('assert'),
    colors = require('colors');

describe('#open()', function () {
    it('should return true', function (done) {
        proxy.page.open('http://www.w3.org', function (result) {
            assert.equal(result, true);
            done();
        });
    });
    it('should return false when server not working', function (done) {
        proxy.page.open('http://localhost:32235', function (result) {
            assert.equal(result, false);
            done();
        });
    });
});
