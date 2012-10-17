var should = require("should"),
    assert = require('assert'),
    colors = require('colors');

describe('#render()', function () {
    it('should return true', function (done) {
        proxy.page.render('./scratch/scratch.png', function (result) {
            assert.equal(result, true);
            done();
        });
    });
});
