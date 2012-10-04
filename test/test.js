var should = require("should"),
    assert = require('assert'),
    colors = require('colors');



describe('phantomProxy', function () {
    var
        phantomProxy = require('../index'),
        self = this,
        proxy;



    beforeEach(function (done) {
        this.timeout(10000);
        phantomProxy.createProxy({}, function (value) {
            proxy = value;
            done();
        });
    });
    afterEach(function (done) {
        this.timeout(10000);
        proxy.phantom.exit(function () {
            done();
        });
    });
    describe('#getProxy()', function () {
        it('should return an object with a phantom property', function (done) {
            this.timeout(10000);
            should.exist(proxy.page);
            should.exist(proxy.phantom);
            done();
        });
    });
    describe('page', function () {
        describe('#open()', function (done) {
            it('should return an object with a phantom property', function (done) {
                this.timeout(10000);
                proxy.page.open('http://localhost:8002/#login/index', function () {
                        done();
                });
            });
        });
    });
});

