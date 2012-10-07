(function () {
    var should = require("should"),
        assert = require('assert'),
        colors = require('colors');

    describe('#get("args")', function () {
        it('should return an arguments array', function (done) {
            proxy.phantom.get('args', function (result) {
                should.exist(JSON.parse(result).length);
                done();
            });
        });
    });
}());
