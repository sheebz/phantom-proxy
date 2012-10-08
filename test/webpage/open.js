var should = require("should"),
    assert = require('assert'),
    colors = require('colors');

describe('#open()', function () {
    it('should return true', function (done) {
        this.timeout(0);
        proxy.page.open('http://www.cnn.com', function (result) {
            assert.equal(result, true);
            done();
        });
    });
    it('should return false when server not working', function (done) {
        this.timeout(0);
        var phantomProxy2 = require('../../index');
        phantomProxy2.create({ port:1068}, function (proxy2) {
            proxy2.page.open('http://localhost:32235', function (result) {
                assert.equal(result, false);
                done();
            });
        });
    });
});
