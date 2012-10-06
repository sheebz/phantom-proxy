(function () {
    var should = require("should"),
        assert = require('assert'),
        colors = require('colors');

    describe('#set()', function () {
        it('should return true', function (done) {
            proxy.page.set('viewportSize', {width:320, height:480}, function (result) {
                assert.equal(result, true);
                done();
            });
        });
        it('should return true', function (done) {
            proxy.page.set('clipRect', { top: 14, left: 3, width: 400, height: 300 }, function (result) {
                assert.equal(result, true);
                done();
            });
        });
    });
}());
