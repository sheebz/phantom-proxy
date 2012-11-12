var should = require("should"),
    assert = require('assert'),
    colors = require('colors'),
    phantomProxy = require('../index');

describe('phantom', function () {
    describe('#addCookie', function () {
        it('should return true', function (done) {
            this.timeout(10000);
            phantomProxy.create({"debug":true}, function (proxy) {
                console.log('proxy: %s', JSON.stringify(proxy.phantom.toString()));
                should.exist(proxy.phantom);
                proxy.phantom.addCookie({
                    'name':'Added-Cookie-Name',
                    'value':'Added-Cookie-Value',
                    'domain':'.localhost'
                }, function (result) {
                    assert.equal(result, true);
                    done();
                });
            });
        });
    });
    describe('#clearCookies', function () {
        it('should return true', function (done) {
            phantomProxy.create({"debug":true}, function (proxy) {
                console.log('proxy: %s', JSON.stringify(proxy));
                should.exist(proxy.phantom);
                proxy.phantom.clearCookies(function (result) {
                    assert.equal(result, true);
                    done();
                });
            });
        });
    });
    describe('#deleteCookie', function () {
        it('should return true', function (done) {
            phantomProxy.create({"debug":true}, function (proxy) {
                console.log('proxy: %s', JSON.stringify(proxy));
                should.exist(proxy.phantom);
                proxy.phantom.addCookie({
                    'name':'testCookie',
                    'value':'Added-Cookie-Value',
                    'domain':'.localhost'
                }, function (result) {
                    assert.equal(result, true);
                    proxy.phantom.deleteCookie('testCookie', function (result) {
                        assert.equal(result, true);

                        done();
                    });
                });
            });
        });
    });
    describe('#get', function () {
        it('should return arguments', function (done) {
            phantomProxy.create({"debug":true}, function (proxy) {
                should.exist(proxy.phantom);
                proxy.phantom.get('args', function (args) {
                    console.log(args);
                    assert.notEqual(0, args.length);
                    done();
                });
            });
        });
        it('should return cookies', function (done) {
            phantomProxy.create({"debug":true}, function (proxy) {
                should.exist(proxy.phantom);
                proxy.phantom.addCookie({
                    'name':'Added-Cookie-Name',
                    'value':'Added-Cookie-Value',
                    'domain':'.localhost'
                }, function (result) {
                    assert.equal(result, true);

                    proxy.phantom.get('cookies', function (cookies) {
                        console.log(cookies);
                        assert.notEqual(0, cookies.length);
                        done();
                    });
                });
            });
        });
        it('should return cookiesEnabled', function (done) {
            phantomProxy.create({"debug":true}, function (proxy) {
                should.exist(proxy.phantom);
                proxy.phantom.get('cookiesEnabled', function (cookiesEnabled) {
                    console.log(cookiesEnabled);
                    assert.equal(true, cookiesEnabled);
                    done();
                });
            });
        });
        it('should return cookiesEnabled', function (done) {
            phantomProxy.create({"debug":true}, function (proxy) {
                should.exist(proxy.phantom);
                proxy.phantom.get('cookiesEnabled', function (cookiesEnabled) {
                    console.log(cookiesEnabled);
                    assert.equal(true, cookiesEnabled);
                    done();
                });
            });
        });
        it('should return libraryPath', function (done) {
            phantomProxy.create({"debug":true}, function (proxy) {
                should.exist(proxy.phantom);
                proxy.phantom.get('libraryPath', function (libraryPath) {
                    console.log(libraryPath);
                   should.exist(libraryPath);
                    done();
                });
            });
        });
        it('should return version', function (done) {
            phantomProxy.create({"debug":true}, function (proxy) {
                should.exist(proxy.phantom);
                proxy.phantom.get('version', function (version) {
                    console.log(version);
                    should.exist(version);
                    done();
                });
            });
        });
    });

//    //TODO:need injectJS test
//    describe('#exit', function () {
//        it('should return true', function (done) {
//            phantomProxy.create({"debug":true}, function (proxy) {
//
//                proxy.phantom.once('exited', function () {
//                    done();
//                });
//
//                console.log('proxy: %s', JSON.stringify(proxy));
//                should.exist(proxy.phantom);
//
//                proxy.phantom.exit(0);
//            });
//        });
//    });
});
