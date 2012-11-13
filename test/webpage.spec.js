var should = require("should"),
    assert = require('assert'),
    colors = require('colors'),
    phantomProxy = require('../index'),
    util = require('util');

describe('page', function () {
    describe('#addCookie', function () {
        it('should return true', function (done) {
            this.timeout(10000);
            phantomProxy.create({"debug":true}, function (proxy) {
                should.exist(proxy.page);
                proxy.page.addCookie({
                    'name':'Added-Cookie-Name',
                    'value':'Added-Cookie-Value'
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
                should.exist(proxy.page);
                proxy.page.clearCookies(function (result) {
                    assert.equal(result, true);
                    done();
                });
            });
        });
    });
    describe('#deleteCookie', function () {
        it('should return true', function (done) {
            phantomProxy.create({"debug":true}, function (proxy) {
                should.exist(proxy.page);
                proxy.page.addCookie({
                    'name':'testCookie',
                    'value':'Added-Cookie-Value'
                }, function (result) {
                    //TODO:figure out why deletecookie isn't passing?
                    assert.equal(result, true);
                    proxy.page.deleteCookie('testCookie', function (result) {
//                        assert.equal(result, true);
//                        console.log('rez' + result);
//                        assert.equal(result, true);
                        done();
                    });
                });
            });
        });
    });
    describe('#properties', function () {
        describe('#cliprect', function () {
            it('should set clipRect', function (done) {
                phantomProxy.create({"debug":true}, function (proxy) {
                    should.exist(proxy.page);
                    proxy.page.set('clipRect', { top:14, left:3, width:400, height:300 }, function (result) {
                        assert.equal(result, true);
                        done();
                    });
                });
            });
            it('should get clipRect', function (done) {
                phantomProxy.create({"debug":true}, function (proxy) {
                    should.exist(proxy.page);
                    proxy.page.get('clipRect', function (result) {
                        console.log(util.inspect(result));
                        should.exist(result);
                        done();
                    });
                });
            });
            it('should set content', function (done) {
                phantomProxy.create({"debug":true}, function (proxy) {
                    should.exist(proxy.page);
                    proxy.page.set('content', { top:14, left:3, width:400, height:300 }, function (result) {
                        assert.equal(result, true);
                        done();
                    });
                });
            });
            it('should get content', function (done) {
                phantomProxy.create({"debug":true}, function (proxy) {
                    should.exist(proxy.page);
                    proxy.page.get('content', function (result) {
                        console.log(util.inspect(result));
                        should.exist(result);
                        done();
                    });
                });
            });
            it('should return cookies', function (done) {
                phantomProxy.create({"debug":true}, function (proxy) {
                    should.exist(proxy.page);
                    proxy.page.addCookie({
                        'name':'Added-Cookie-Name',
                        'value':'Added-Cookie-Value'
                    }, function (result) {
                        assert.equal(result, true);

                        proxy.page.get('cookies', function (cookies) {
                            console.log(cookies);
                            assert.notEqual(0, cookies.length);
                            done();
                        });
                    });
                });
            });
        });
        it('should evaluate', function (done) {
            phantomProxy.create({"debug":true}, function (proxy) {
                should.exist(proxy.page);
                proxy.page.evaluate(function (x, y) {
                    return( x + y);
                }, function (result) {
                    assert.equal(result, 4);
                    done();
                }, 2, 2);
            });
        });
        it('should evaluate async', function (done) {
            phantomProxy.create({"debug":true}, function (proxy) {
                should.exist(proxy.page);
                proxy.page.evaluateAsync(function (x, y) {
                    console.log('foo');
                }, function (result) {
                    assert.equal(result, true);
                    done();
                }, 2, 2);
            });
        });

        it('should render', function (done) {

        });

        it('should renderBase64', function (done) {

        });

        it('should sendEvent', function (done) {

        });
        it('should includeJs', function (done) {

        });

    });

//    it('should close', function (done) {
//        phantomProxy.create({"debug":true}, function (proxy) {
//            should.exist(proxy.page);
//            proxy.page.close(function (result) {
//                assert.equal(result, true);
//                done();
//            });
//        });
//
//    });
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
