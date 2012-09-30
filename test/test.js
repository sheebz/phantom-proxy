var should = require("should"),
    assert = require('assert'),
    phantomProxy = require('../phantom-proxy'),
    colors = require('colors');

phantomProxy.createProxy({}, function (proxy) {
    proxy.page.open('http://localhost:8007/#login/index', function () {
        proxy.page.waitForSelector('.active-page', function () {
            proxy.page.render('loginTest.png', function(){
                proxy.phantom.exit(0, function(){
                    console.log('done'.green.bold);
                });
            });
        });
    });
});

//describe('phantomProxy', function () {
//    describe('#get-version', function () {
//        it('should return the phantom version', function (done) {
//            this.timeout(10000);
//            phantomProxy.createProxy({}, function (proxy) {
//                should.exist(proxy);
//                proxy.phantom.get('version', function (version) {
//                    should.exist(version);
//                    proxy.phantom.exit(0, function () {
//                        done();
//                    });
//                });
//            });
//        });
//    });
//    describe('#set()', function () {
//        it('should set the viewport size', function (done) {
//            this.timeout(10000);
//            phantomProxy.createProxy({}, function (proxy) {
//                should.exist(proxy);
//                proxy.page.set('viewportSize', { width:480, height:800 }, function () {
//                    proxy.phantom.exit(0, function () {
//                        done();
//                    });
//                });
//            });
//        });
//    });
//    describe('#evaluate()', function () {
//        it('should return 1 body tag', function (done) {
//            this.timeout(10000);
//            phantomProxy.createProxy({}, function (proxy) {
//                should.exist(proxy);
//                proxy.page.open('http://localhost:8007/#login/index', function () {
//                    proxy.page.evaluate(function (selector) {
//                        return document.querySelectorAll(selector).length;
//                    }, function (result) {
//                        assert.equal(1, result);
//                        proxy.phantom.exit(0, function () {
//                            done();
//                        });
//                    }, 'body');
//
//                });
//            });
//        });
//        it('should return 0 results', function (done) {
//            this.timeout(10000);
//            phantomProxy.createProxy({}, function (proxy) {
//                should.exist(proxy);
//                proxy.page.open('http://localhost:8007/#login/index', function () {
//                    proxy.page.evaluate(function (selector) {
//                        return document.querySelectorAll(selector).length;
//                    }, function (result) {
//                        assert.equal(0, result);
//                        proxy.phantom.exit(0, function () {
//                            done();
//                        });
//                    }, 'non-existing-el');
//                });
//            });
//        });
//        it('should render a file', function (done) {
//            this.timeout(10000);
//            phantomProxy.createProxy({}, function (proxy) {
//                should.exist(proxy);
//                proxy.page.open('http://localhost:8007/#login/index', function () {
//                    proxy.page.render('testfile5.png', function () {
//                        proxy.phantom.exit(0, function () {
//                            done();
//                        });
//                    });
//                });
//            });
//        });
//        it('should render a file in base64 format', function (done) {
//            this.timeout(10000);
//            phantomProxy.createProxy({}, function (proxy) {
//                should.exist(proxy);
//                proxy.page.open('http://localhost:8007/#login/index', function () {
//                    proxy.page.renderBase64('PNG', function (result) {
//                        should.exist(result);
//                        console.log('image' + result);
//                        proxy.phantom.exit(0, function () {
//                            done();
//                        });
//                    });
//                });
//            });
//        });
//    });
//});
