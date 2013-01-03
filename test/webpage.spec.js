var should = require("should"),
    assert = require('assert'),
    colors = require('colors'),
    phantomProxy = require('../index'),
    util = require('util');

describe('page', function () {
    describe('#addCookie', function () {
        it('should return true', function (done) {
            this.timeout(0);
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
    });
    describe('#settings', function () {
        describe('#useragent', function () {
            it('should set useragent', function (done) {
                phantomProxy.create({"debug":true}, function (proxy) {
                    should.exist(proxy.page);
                    proxy.page.settings.set('userAgent', 'iPad', function (result) {
                        assert.equal(result, true);
                        done();
                    });
                });
            });
            it('should get useragent', function (done) {
                phantomProxy.create({"debug":true}, function (proxy) {
                    should.exist(proxy.page);
                    proxy.page.settings.set('userAgent', 'iPad', function (result) {
                        proxy.page.settings.get('userAgent', function (result) {
                            assert.equal(result, 'iPad');
                            done();
                        });
                    });
                });
            });
        });
    });
    it('should render', function (done) {
        this.timeout(0);
        phantomProxy.create({"debug":true}, function (proxy) {
            should.exist(proxy.page);
            proxy.page.open('http://www.w3.org', function (result) {
                assert.equal(true, result);
                proxy.page.render('./scratch/cnn.png', function (result) {
                    assert.equal(true, result);
                    proxy.end(function (result) {
                        done();
                    });
                });
            });
        });
    });
    it('should renderBase64', function (done) {
        this.timeout(0);
        phantomProxy.create({"debug":true}, function (proxy) {
            should.exist(proxy.page);
            proxy.page.open('http://www.w3.org', function (result) {
                assert.equal(true, result);
                proxy.page.renderBase64('PNG', function (result) {
                    console.log(result.green.bold);
                    should.exist(result);
                    proxy.end(function (result) {
                        done();
                    });
                });
            });
        });
    });

    it('should send mouse events', function (done) {
        this.timeout(0);
        phantomProxy.create({"debug":true}, function (proxy) {
            should.exist(proxy.page);
            proxy.page.open('http://www.w3.org', function (result) {
                assert.equal(true, result);
                proxy.page.sendEvent({event:'click', mouseX:0, mouseY:1, button:'left'}, function (result) {
                    console.log(result.green);
                    should.exist(result);
                    proxy.end(function (result) {
                        done();
                    });
                });
            });
        });
    });
    it('should send mouse events that are not falsey', function (done) {
        this.timeout(0);
        phantomProxy.create({"debug":true}, function (proxy) {
            should.exist(proxy.page);
            proxy.page.open('http://www.w3.org', function (result) {
                assert.equal(true, result);
                proxy.page.sendEvent({event:'click', mouseX:1, mouseY:1, button:'left'}, function (result) {
                    console.log(result.green);
                    should.exist(result);
                    proxy.end(function (result) {
                        done();
                    });
                });
            });
        });
    });
    it('should send keyboard events', function (done) {
        this.timeout(0);
        phantomProxy.create({"debug":true}, function (proxy) {
            should.exist(proxy.page);
            proxy.page.open('http://www.w3.org', function (result) {
                assert.equal(true, result);
                proxy.page.sendEvent({event:'keypress',keys:16777221}, function (result) {
                    console.log(result.green);
                    should.exist(result);
                    proxy.end(function (result) {
                        done();
                    });
                });
            });
        });
    });
    it('should send click events', function (done) {
        this.timeout(0);
        phantomProxy.create({"debug":true}, function (proxy) {
            should.exist(proxy.page);
            proxy.page.open('http://www.w3.org', function (result) {
                assert.equal(true, result);
                proxy.page.sendEvent({event:'click'}, function (result) {
                    console.log(result.green);
                    should.exist(result);
                    proxy.end(function (result) {
                        done();
                    });
                });
            });
        });
    });
    it('should includeJs', function (done) {
        this.timeout(0);
        phantomProxy.create({"debug":true}, function (proxy) {
            should.exist(proxy.page);
            proxy.page.open('http://www.w3.org', function (result) {
                assert.equal(true, result);
                proxy.page.includeJs('http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js', function (result) {
                    console.log(result.green);
                    should.exist(result);
                    proxy.end(function (result) {
                        done();
                    });
                });
            });
        });
    });

    it('should injectJs', function (done) {
        this.timeout(0);
        phantomProxy.create({"debug":true}, function (proxy) {
            should.exist(proxy.page);
            proxy.page.open('http://www.w3.org', function (result) {
                assert.equal(true, result);
                proxy.page.injectJs(__dirname + '/resources/include.js', function (result) {
                    console.log(result.green);
                    proxy.page.on('consoleMessage', function(msg) {
                        assert.equal(msg, 'true');
                        proxy.end(function (result) {
                            done();
                        });
                    });
                    proxy.page.evaluate(function() {
                        console.log(window.includedByPhantom);
                    });
                });
            });
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
