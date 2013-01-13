(function (module) {
    'use strict';
    var util = require('util'),
        events = require('events'),
        _ = require('underscore'),
        request = require('./request/main');

    var WebPage = function (options) {
            var self = this,
                executeMethod = function () {
                    var self = this,
                        callbackFn = arguments[1],
                        methodName = arguments[0],
                        args = (arguments.length > 2) ? Array.prototype.slice.call(arguments, 2, arguments.length) :
                            [
                            ],
                        url = this.options.hostAndPort + methodName;
                    this.options.debug && console.log('calling execute method  for %s and with %d params: %s'.grey, url, args.length, JSON.stringify(args));

                    request.post(url, {form:{ args:JSON.stringify(args)}},
                        function (error, response, body) {
                            error && console.error(error);
                            if (response && response.statusCode === 200) {
                                callbackFn && callbackFn.call(self, true, body);
                            }
                            else {
                                console.log('error in response %s'.red.bold, body);
                                callbackFn && callbackFn.call(self, false, body);
                            }
                        });
                };
            self.options = options;
            events.EventEmitter.call(this);

            //sets property value ex. viewportSize
            _.extend(this, {
                set:function (propertyName, propertyValue, callbackFn) {
                    var self = this;

                    // allow functions to be set
                    if(typeof propertyValue === 'function') {
                        propertyValue = {
                            _fn: propertyValue.toString()
                        };
                    }

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
                //gets property value ex. version
                get:function (propertyName, callbackFn) {
                    var self = this;

                    request.post(this.options.hostAndPort + '/page/properties/get', {form:{ propertyName:propertyName}},
                        function (error, response, body) {
                            error && console.error(error);
                            if (response && response.statusCode === 200) {
                                callbackFn && callbackFn.call(self, body);
                            }
                            else {
                                console.log('error in response %s'.red.bold, body);
                                callbackFn && callbackFn.call(self, false, body);
                            }
                        });
                },
                settings: {
                    set:function (propertyName, propertyValue, callbackFn) {
                        request.post(self.options.hostAndPort + '/page/settings/set', {
                            form:{
                                propertyName:propertyName,
                                propertyValue:JSON.stringify(propertyValue)
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
                    get:function (propertyName, callbackFn) {
                        request.post(self.options.hostAndPort + '/page/settings/get', {form:{propertyName:propertyName}},
                            function (error, response, body) {
                                error && console.error(error);
                                if (response && response.statusCode === 200) {
                                    console.log('response is ',body, 'code: ',response.statusCode);
                                    console.log('response parsed: ',JSON.parse(body));
                                    callbackFn && callbackFn.call(self, JSON.parse(body));
                                }
                                else {
                                    console.log('error in response %s'.red.bold, body);
                                    callbackFn && callbackFn.call(self, false, body);
                                }
                            });
                    }
                },
                includeJs:function (url, callbackFn) {

                    executeMethod.call(this, '/page/functions/includeJs', callbackFn, url);
                },
                sendEvent:function (eventArgs, callbackFn) {
                    var args =
                        [
                            '/page/functions/sendEvent',
                            callbackFn,
                            eventArgs.event
                        ];

                    if(eventArgs.mouseX && eventArgs.mouseY) {
                        args = args.concat([
                            eventArgs.mouseX,
                            eventArgs.mouseY
                        ]);
                    }
                    eventArgs.mouseX && eventArgs.mouseY && eventArgs.button && args.push(
                        eventArgs.button
                    );
                    eventArgs.keys && args.push(eventArgs.keys);

                    executeMethod.apply(this, args);
                    return this;
                },
                addCookie:function (cookie, callbackFn) {
                    executeMethod.call(this, '/page/functions/addCookie', callbackFn, cookie);
                    return this;
                },
                clearCookies:function (callbackFn) {
                    executeMethod.call(this, '/page/functions/clearCookies', callbackFn);
                },
                deleteCookie:function (cookieName, callbackFn) {
                    executeMethod.call(this, '/page/functions/deleteCookie', callbackFn, cookieName);
                },
                close:function (callbackFn) {
                    executeMethod.call(this, '/page/functions/close', callbackFn);
                    return this;
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
                //Evaluates the given function in the context of the web page.
                // The execution is sandboxed, the web page has no access to the phantom object and it can't probe its own setting.
                evaluateAsync:function (expressionFn, callbackFn) {
                    var self = this,
                        url = self.options.hostAndPort + '/page/functions/evaluateAsync';

                    self.options.debug && console.log('calling url: %s', url);

                    request.post(url, {
                            form:{expressionFn:expressionFn.toString(), args:JSON.stringify(Array.prototype.slice.call(arguments, 2, arguments.length), null, 4)}
                        },
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
                        args =
                            [
                                format
                            ],
                        url = this.options.hostAndPort + '/page/functions/renderBase64';
                    this.options.debug && console.log('calling execute method  for %s and with %d params: %s'.grey, url, args.length, JSON.stringify(args));

                    request.post(url, {form:{ args:JSON.stringify(args)}},
                        function (error, response, body) {
                            error && console.error(error);
                            if (response && response.statusCode === 200) {
                                callbackFn && callbackFn.call(self, body);
                            }
                            else {
                                console.log('error in response %s'.red.bold, body);
                                callbackFn && callbackFn.call(self, false, body);
                            }
                        });
                    return this;
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
                },

                injectJs:function (filename, callbackFn) {

                    executeMethod.call(this, '/page/functions/injectJs', callbackFn, filename);
                    return this;
                }

//            evaluateAsync:function (expressionFn, callbackFn) {
//                executeMethod.call(this, 'page/functions/deleteCookie', callbackFn);
//            },
            });
        }
        ;
    util.inherits(WebPage, events.EventEmitter);
    module.exports = WebPage;
}
    (module)
    )
;
