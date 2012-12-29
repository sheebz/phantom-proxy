// features/support/world.js

var phantomProxy = require('phantom-proxy'),
    colors = require('colors'),
    _ = require('underscore'),
    Q = require('Q'),
    rimraf = require('rimraf');

colors.setTheme({
    silly:'rainbow',
    input:'grey',
    verbose:'cyan',
    prompt:'grey',
    info:'green',
    data:'grey',
    help:'cyan',
    warn:'yellow',
    debug:'cyan',
    error:'red'
});

var World = function World(worldCallback) {
    var self = this;
    self.baseUrl = 'http://localhost:8002/#';

    _.extend(self, {
        initialize:function (callbackFn) {
            //remove images

            require("rimraf").sync('./test/features/screen_captures');
            phantomProxy.create({}, function (proxy) {
                self.proxy = proxy;

//                proxy.page.on('alert', function (msg) {
//                    console.log('alert: %s'.info.bold, msg);
//                });
                proxy.page.on('callback', function (data) {
                    console.log(JSON.stringify(data).green.bold);
                });
                proxy.page.on('closing', function (closingPage) {
                    console.log('page is closing url is %s'.info.bold, closingPage);
                });
                proxy.page.on('onConfirm', function (msg) {
                    console.log('CONFIRM: %s'.info.bold, msg);
                    return true;
                });
                proxy.page.on('consoleMessage', function (msg, line, sourceId) {
                    console.log('%s %s %s'.debug, msg, line, sourceId);
                });
                proxy.page.on('error', function (msg, trace) {
                    console.log('%s %s'.error, msg, trace);
                });
                proxy.page.on('initialized', function () {
                    console.log('initialized'.info.bold);
                });
                proxy.page.on('loadFinished', function (status) {
                    console.log('load finished: %s'.status.bold);
                });
                proxy.page.on('loadStarted', function () {
                    console.log('loadStarted'.info.bold);
                });
                proxy.page.on('navigationRequested', function (url, type, willNavigate, main) {
                    console.log('navigationRequested %s'.info.bold, url);
                });
                proxy.page.on('pageCreated', function (newPage) {
                    console.log('pageCreated %s'.info.bold, newPage);
                });
                proxy.page.on('prompt', function (msg, defaultVal) {
                    console.log('PROMPT: %s'.info.bold, msg);
                });
                proxy.page.on('resourceRequested', function (resource) {
                    console.log('resource requested: %s'.data, resource.url);
                });
                proxy.page.on('resourceReceived', function (response) {
                    console.log('resource received: %s'.data, response.url);
                });
                proxy.page.on('urlChanged', function (targetUrl) {
                    console.log('url changed: %s'.info, JSON.stringify(targetUrl));
                });

                proxy.page.set('viewportSize', { width:320, height:480 }, function (result) {
                    callbackFn();
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
        saveImage:function (fileName, callbackFn) {

            if (typeof fileName === 'function') {
                callbackFn = fileName;
                fileName = Date.now().toString() + '.png'
            }

            var deferred = Q.defer();
            var path = 'test/features/screen_captures/' + fileName;
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
            }, function (result) {
                deferred.resolve(result);
                callbackFn && callbackFn();
            }, selector, fieldValue);
            return deferred.promise;
        },
        visit:function (url, callbackFn) {
            self.proxy.page.open(self.baseUrl + url, function (result) {
                callbackFn.call(self, result);
            });
        }});

    worldCallback.call(this);
};
exports.World = World;
