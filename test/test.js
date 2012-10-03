var should = require("should"),
    assert = require('assert'),
    colors = require('colors');

require('../index').createProxy({}, function (proxy) {
        var page = proxy.page,
            phantom = proxy.phantom;
        page.onConsoleMessage = function (event) {
            console.log(JSON.stringify(event));
        }
        page.open('http://localhost:8002/#login/index', function () {
            page.waitForSelector('#login-index', function () {
                page.evaluate(function () {
                    $('#userName').val('test');
                    $('#password').val('test');
                    return true;
                }, function (result) {
                    console.log(result);
                    phantom.exit(function () {
                        console.log('done');
                    });
                });
            });
        });
    }
)
;

//describe('phantomProxy', function () {
//    var
//        phantomProxy = require('../index'),
//        self = this,
//        proxy;
//
//    this.initProxy = function (callbackFn) {
//        console.log('init');
//        phantomProxy.createProxy({}, function (value) {
//            proxy = value;
//            callbackFn();
//        });
//    };
//
//    beforeEach(function (done) {
//        this.timeout(0);
//        self.initProxy(done);
//    });
//    afterEach(function (done) {
//        this.timeout(0);
//        proxy.phantom.exit(function () {
//            done();
//        });
//    });
//    describe('#getProxy()', function () {
//        it('should return an object with a phantom property', function (done) {
//            this.timeout(0);
//            should.exist(proxy.page);
//            should.exist(proxy.phantom);
//            done();
//        });
//    });
//    describe('page', function () {
//        describe('#open()', function () {
//            it('should return an object with a phantom property', function (done) {
//                this.timeout(0);
//                proxy.page.open('http://localhost:8002/#login/index', function () {
//                    proxy.page.evaluate(function(){
//                        $('#userName').val('test');
//                        $('#password').val('test');
//
//                        return true;
//                    }, function(result){
//                        console.log(result);
//                    });
//                });
//            });
//        });
//    });
//});
//
