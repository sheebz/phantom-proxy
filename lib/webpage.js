(function (module) {
    'use strict';
    var util = require('util'),
        events = require('events'),
        _ = require('underscore'),
        request = require('./request/main');

    var WebPage = function (options) {
        var self = this;
        self.options = options;
        events.EventEmitter.call(this);

        //sets property value ex. viewportSize
        _.extend(this, {
            set:function (propertyName, propertyValue, callbackFn) {
                var self = this;
                request.post(self.options.hostAndPort + '/page/properties/set', {
                        form:{
                            propertyName:propertyName,
                            propertyValue:JSON.stringify(propertyValue, null, 4)
                        }
                    },
                    function (error, response, body) {
                        if (response && response.statusCode === 200) {
                            callbackFn && callbackFn.call(self, !!body);
                        }
                        else {
                            callbackFn && callbackFn.call(self, false, body);
                        }
                    });
            },
            //Opens the URL and loads it to the page. Once page is loaded, the optional callback is called using onLoadFinished,
            // and also provides the page status to the function ('success' or 'fail').
            open:function (openUrl, callbackFn) {
                var self = this,
                    url = self.options.hostAndPort + '/page/functions/open';

                self.options.debug && console.log('calling url: %s', url);
                request.post(url, {form:{ args:JSON.stringify(
                        [
                            openUrl
                        ], null, 4)}},
                    function (error, response, body) {
                        self.options.debug && console.log(body);
                        if (response && response.statusCode === 200) {
                            body === 'success' ?
                                callbackFn && callbackFn.call(self, true) : callbackFn && callbackFn.call(self, false);
                        }
                        else {

                            callbackFn && callbackFn.call(self, false, body);
                        }
                    }
                );
            },
            //Evaluates the given function in the context of the web page.
            // The execution is sandboxed, the web page has no access to the phantom object and it can't probe its own setting.
            evaluate:function (expressionFn, callbackFn) {
                var self = this,
                    url = self.options.hostAndPort + '/page/functions/evaluate';

                self.options.debug && console.log('calling url: %s', url);

                request.post(url, {
                        form:{expressionFn:expressionFn.toString(), args:JSON.stringify(Array.prototype.slice.call(arguments, 2, arguments.length), null, 4)}
                    },
                    function (error, response, body) {
                        if (response && response.statusCode === 200) {
                            callbackFn && callbackFn.call(self, body);
                        }
                        else {
                            console.error(body);
                            callbackFn && callbackFn.call(self, body);
                        }
                    });
            },
            //Renders the web page to an image buffer and save it as the specified file.
            // Currently the output format is automatically set based on the file extension. Supported formats are PNG, GIF, JPEG, and PDF.
            render:function (filename, callbackFn) {
                var self = this,
                    url = self.options.hostAndPort + '/page/functions/render';

                self.options.debug && console.log('calling url: %s', url);
                request.post(url, {form:{ args:JSON.stringify(
                        [
                            filename
                        ], null, 4)}},
                    function (error, response, body) {
                        error && console.error(error);
                        if (response && response.statusCode === 200) {
                            callbackFn && callbackFn.call(self, !!body);
                        }
                        else {
                            console.error(body);
                            callbackFn && callbackFn.call(self, body);
                        }
                    }
                );
            },
            //Renders the web page to an image buffer and returns the result as a base64-encoded string representation of that image.
            // Supported formats are PNG, GIF, and JPEG.
            renderBase64:function (format, callbackFn) {
                var self = this,
                    url = self.options.hostAndPort + '/page/functions/renderBase64';

                self.options.debug && console.log('calling url: %s', url);
                request.post(url, {form:{ args:JSON.stringify(
                        [
                            format
                        ], null, 4)}},
                    function (error, response, body) {
                        if (response && response.statusCode === 200) {
                            callbackFn && callbackFn.call(self, !!body);
                        }
                        else {
                            console.error(body);
                            callbackFn && callbackFn.call(self, body);
                        }
                    });
            },
            //additional methods not in phantomjs api
            //waits for selector to appear, then executes callbackFn
            waitForSelector:function (selector, callbackFn, timeout) {
                var self = this,
                    startTime = Date.now(),
                    timeoutInterval = 150,
                    testRunning = false,
                //if evaluate succeeds, invokes callback w/ true, if timeout,
                // invokes w/ false, otherwise just exits
                    testForSelector = function () {

                        var elapsedTime = Date.now() - startTime;

                        if (elapsedTime > timeout) {
                            self.options.debug && console.log('warning: timeout occurred while waiting for selector:"%s"'.yellow, selector);
                            callbackFn(false);
                            return;
                        }

                        self.evaluate(function (selectorToEvaluate) {
                            return document.querySelectorAll(selectorToEvaluate).length;
                        }, function (result) {
                            testRunning = false;
                            if (result > 0) {//selector found
                                callbackFn(true);
                            }
                            else {
                                setTimeout(testForSelector, timeoutInterval);
                            }
                        }, selector);
                    };

                timeout = timeout || 10000; //default timeout is 2 sec;
                setTimeout(testForSelector, timeoutInterval);
            }
//            evaluateAsync:function (expressionFn, callbackFn) {
//                executeMethod.call(this, 'page/functions/deleteCookie', callbackFn);
//            },
//            includeJs:function (url, callbackFn) {
//
//
//            },
//            injectJs:function (filename, callbackFn) {
//
//            }
        });
    };
    util.inherits(WebPage, events.EventEmitter);
    module.exports = WebPage;
}(module));
