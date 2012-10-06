(function () {
    var should = require("should"),
        assert = require('assert'),
        colors = require('colors');

    describe('#evaluate()', function () {
        it('should return 0', function (done) {
            proxy.page.evaluate(function () {
                    return document.querySelectorAll('sfdsdfsdfsd').length;
                },
                function (result) {
                    console.log(result);
                    assert.equal(result, 0);
                    done();
                });
        });
        it('should return 1', function (done) {
            proxy.page.evaluate(function () {
                    return document.querySelectorAll('html').length;
                },
                function (result) {
                    assert.equal(result, 1);
                    done();
                });
        });
        it('should return 1', function (done) {
            proxy.page.evaluate(function (selector) {
                    return document.querySelectorAll(selector).length;
                },
                function (result) {
                    assert.equal(result, 1);
                    done();
                }, 'html');
        });
        it('should return 0', function (done) {
            proxy.page.evaluate(function (selector) {
                    return document.querySelectorAll(selector).length;
                },
                function (result) {
                    assert.equal(result, 0);
                    done();
                }, 'foo987');
        });
    });
}());
