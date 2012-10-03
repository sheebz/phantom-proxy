var should = require("should"),
    assert = require('assert'),
    colors = require('colors');

describe('phantomProxy', function () {
    var
        phantomProxy = require('../index'),
        self = this,
        proxy;

    this.initProxy = function (callbackFn) {
        console.log('init');
        phantomProxy.createProxy({}, function (value) {
            proxy = value;
            callbackFn();
        });
    };

    beforeEach(function (done) {
        this.timeout(0);
        self.initProxy(done);
    });

    describe('#getProxy()', function () {
        it('should return an object with a phantom property', function (done) {
            this.timeout(0);
            should.exist(proxy.page);
            should.exist(proxy.phantom);
            done();
        });
    });
    describe('page', function () {
        describe('#open()', function () {
            it('should return an object with a phantom property', function (done) {
                this.timeout(0);
                proxy.page.open('http://www.w3.org', function () {
                    done();
                });
            });
        });
    });
});

