var should = require("should"),
    assert = require('assert'),
    colors = require('colors'),
    phantomProxy = require('../index');

describe('webpage', function () {
    describe('#open', function () {
        it('should return true', function (done) {
            this.timeout(0);
            phantomProxy.create({"debug":true}, function (proxy) {
                proxy.page.open('http://www.w3.org', function (result) {
                    assert.equal(result, true);

                    describe('#waitForSelector', function () {
                        proxy.page.waitForSelector('body', function (result) {
                            assert.equal(result, true);
                            describe('#render', function () {
                                proxy.page.render('./scratch/scratch.png', function (result) {
                                    assert.equal(result, true);
                                    proxy.end(function () {
                                        done();
                                    });
                                });
                            });
                        }, 1000);
                    });
                });
            });
        });
    });
    describe('#evaluate()', function () {
        it('should return 0', function (done) {
            phantomProxy.create(function (proxy) {
                proxy.page.evaluate(function () {
                        return document.querySelectorAll('sfdsdfsdfsd').length;
                    },
                    function (result) {
                        console.log(result);
                        assert.equal(result, 0);
                        done();
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
                after(function (done) {
                    proxy.end(function (result) {
                        done();
                    });
                });
            });
        });
    });
});
