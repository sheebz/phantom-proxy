(function () {
    var should = require("should"),
        assert = require('assert'),
        colors = require('colors');

    describe('#waitForSelector()', function () {
        it('should timeout and return false', function (done) {
            this.timeout(0);
            proxy.page.open('http://www.w3.org', function (result) {
                assert.equal(result, true);
                proxy.page.waitForSelector('dfsafdsa', function (result) {
                    assert.equal(result, false);
                    done();
                }, 1000);
            });
        });

    });
}());
