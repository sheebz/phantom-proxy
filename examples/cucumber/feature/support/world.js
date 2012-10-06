// features/support/world.js

var phantomProxy = require('phantom-proxy'),
    colors = require('colors'),
    _ = require('underscore'),
    Q = require('Q');
colors.setTheme({
    silly:'rainbow',
    input:'grey',
    verbose:'cyan',
    prompt:'grey',
    info:'green',
    data:'grey',
    help:'cyan',
    warn:'yellow',
    debug:'blue',
    error:'red'
});

var World = function World(worldCallback) {
    var self = this;
    self.baseUrl = 'http://localhost:8002/#';
    _.extend(self, {
        initialize:function () {
            phantomProxy.create({}, function (proxy) {
                self.proxy = proxy;
                proxy.page.onUrlChanged = function (event) {
                    console.log('url changed'.info);
                };
                proxy.page.onError = function (event) {
                    console.log(event.data.error.error);
                    console.log(event.data.stack.error);
                };
                proxy.page.onConsoleMessage = function (event) {
                    console.log(event.data.string.green.bold);
                };
                proxy.page.onResourceRequested = function (event) {
                    console.log(event.data.url.data);
                };
                proxy.page.set('viewportSize', { width:320, height:480 }, function (result) {
                    worldCallback.call(self);
                });

            });
        },
        render:function (filename, callbackFn) {
            var deferred = Q.defer();
            self.proxy.page.render(filename, function () {
                deferred.resolve(self);
                callbackFn.call(self);
            });
            return deferred.promise;
        },
        exit:function (callbackFn) {
            phantomProxy.end();
        },
        waitForSelector:function (selector, callbackFn) {
            self.proxy.page.waitForSelector(selector, callbackFn);
        },
        evaluate:function (expression, callbackFn) {
            self.proxy.page.evaluate(expression, function (result) {
                callbackFn(result);
            });
        },
        saveImage:function (filename, callbackFn) {
            var deferred = Q.defer();
            var path = 'test/features/screen_captures/' + filename;
            self.proxy.page.render(path, function (result) {
                deferred.resolve(result);
                callbackFn && callbackFn(result);
            });
            return deferred.promise;
        },
        enterField:function (selector, fieldValue, callbackFn) {
            var deferred = Q.defer();
            self.proxy.page.evaluate(function (selector, fieldValue) {
                $(selector).val(fieldValue);
                return true;
            }, function () {
                deferred.resolve(true);
                callbackFn && callbackFn();
            }, selector, fieldValue);
            return deferred.promise;
        },
        visit:function (url, callbackFn) {
            self.proxy.page.open(self.baseUrl + url, function () {
                callbackFn.call(self);
            });
        }});

    self.initialize();

};
exports.World = World;
