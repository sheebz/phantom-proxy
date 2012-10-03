// features/support/world.js

var phantom = require('phantom-proxy'),
    colors = require('colors'),
    _ = require('underscore'),
    Q = require('Q');

var World = function World(worldCallback) {
    var self = this;
    self.baseUrl = 'http://localhost:8007/#';
    _.extend(self, {
        initialize:function () {
            phantom.createProxy({}, function (proxy) {
                self.proxy = proxy;
                phantom.page.onConsoleMessage = function (event) {
                    console.log(JSON.stringify(event).grey);
                };
                phantom.page.onResourceRequested = function (event) {
                    console.log(JSON.stringify(event).grey);
                };
                console.log('phantom created'.grey);
                worldCallback.call(self);
            });
        },
        render:function (filename, callbackFn) {
            self.proxy.page.render(filename, function () {
                callbackFn.call(self);
            });
        },
        exit:function (callbackFn) {
            self.proxy.phantom.exit(function () {
                callbackFn.call(self);
            });
        },
        waitForSelector:function (selector, callbackFn) {
            self.proxy.page.waitForSelector(selector, callbackFn);
        },
        visit:function (url, callbackFn) {
            self.proxy.page.open(url, function () {
                callbackFn.call(self);
            });
        }});

    self.initialize();

};
exports.World = World;
