/*global  module:false, console:false, require:false*/
(function (module) {

    // return a function instance from a .toString()ed function
    function parseFn(fn) {
        var startBody = fn.indexOf('{') + 1,
            endBody = fn.lastIndexOf('}'),
            startArgs = fn.indexOf('(') + 1,
            endArgs = fn.indexOf(')');
        return new Function(fn.substring(startArgs, endArgs), fn.substring(startBody, endBody));
    }

    'use strict';
    module.exports = {

        create:function (server) {
            this.page = require('webpage').create();
            this.bindEvents(server);
            return this;
        },
        setProperty:function (propertyName, propertyValue) {
            var self = this;
            try {
                var parsed = JSON.parse(propertyValue);

                // allow functions to be set, at the moment specifically for
                // onConfirmCallback function
                this.page[propertyName] = parsed._fn ?
                    parseFn(parsed._fn) : parsed;
                this.response.write(this.page[propertyName]);
                this.response.statusCode = 200;
                this.response.close();
            } catch (ex) {
                self.response.statusCode = 500;
                self.response.write(ex.toString());
                self.response.close();
            }
        },
        getProperty:function (propertyName) {
            var self = this;
            try {
                var result = this.page[propertyName];
                this.response.write(JSON.stringify(result));
                this.response.statusCode = 200;
                this.response.close();
            } catch (ex) {
                self.response.statusCode = 500;
                self.response.write(ex.toString());
                self.response.close();
            }
        },
        setSetting:function (propertyName, propertyValue) {
            var self = this;
            try {
                this.page.settings[propertyName] = JSON.parse(propertyValue);
                this.response.write(this.page.settings[propertyName]);
                this.response.statusCode = 200;
                this.response.close();
            } catch (ex) {
                self.response.statusCode = 500;
                self.response.write(ex.toString());
                self.response.close();
            }
        },
        getSetting:function (propertyName) {
            var self = this;
            try {
                var result = this.page.settings[propertyName];
                this.response.write(JSON.stringify(result));
                this.response.statusCode = 200;
                this.response.close();
            } catch (ex) {
                self.response.statusCode = 500;
                self.response.write(ex.toString());
                self.response.close();
            }
        },
        setResponse:function (response) {
            this.response = response;
        },
        evaluate:function () {
            var self = this;
            try {
                var result = self.page.evaluate.apply(self.page, arguments);

                self.response.statusCode = 200;
                self.response.write(result);
                self.response.close();
            } catch (exception) {
                self.response.statusCode = 500;
                self.response.write(exception.toString());
                self.response.close();
            }
        },
        evaluateAsync:function () {
            var self = this;
            try {
                self.page.evaluateAsync.apply(self.page, arguments);

                self.response.statusCode = 200;
                self.response.write(true);
                self.response.close();
            } catch (exception) {
                self.response.statusCode = 500;
                self.response.write(exception.toString());
                self.response.close();
            }
        },
        close:function () {
            var self = this;
            try {
                self.page.close();
                self.response.status = 200;
                self.response.write(true);
                self.response.close();
            } catch (exception) {
                self.response.statusCode = 500;
                self.response.write(exception.toString());
                self.response.close();
            }
        },
        sendEvent:function () {
            var self = this;
            try {
                this.page.sendEvent.apply(self.page, arguments);
                self.response.status = 200;
                self.response.write(true);
                self.response.close();
            }
            catch (error) {
                self.response.status = 500;
                self.response.write(error);
                self.response.close();
            }
        },
        includeJs:function (url) {
            var self = this;
            var called = false;
            try {
                this.page.includeJs.call(self.page, url, function () {
                    if (called) {
                        return;
                    }
                    called = true;
                    self.response.statusCode = 200;
                    self.response.write(status);
                    self.response.close();
                });
            } catch (exception) {
                called = true; // for any strange case
                self.response.statusCode = 500;
                self.response.write(exception.toString());
                self.response.close();
            }
        },
        injectJs:function (file) {
            var self = this;
            try {
                var result = this.page.injectJs(file);
                this.response.statusCode = 200;
                this.response.write(result);
                this.response.close();
            } catch (exception) {
                self.response.statusCode = 500;
                self.response.write(exception.toString());
                self.response.close();
            }
        },
        open:function (url) {
            var self = this;
            var called = false;
            try {
                this.page.open.call(self.page, url, function (status) {
                    if (called) {
                        return;
                    }
                    called = true;
                    if (status === "success") {
                        self.response.statusCode = 200;
                    }
                    else {
                        self.response.statusCode = 500;
                    }
                    self.response.write(status);
                    self.response.close();
                });
            } catch (exception) {
                called = true; // for any strange case
                self.response.statusCode = 500;
                self.response.write(exception.toString());
                self.response.close();
            }
        },
        addCookie:function (cookie) {
            var self = this;
            try {
                var result = this.page.addCookie(cookie);
                this.response.statusCode = 200;
                this.response.write(result);
                this.response.close();
            } catch (ex) {
                self.response.statusCode = 500;
                self.response.write(ex.toString());
                self.response.close();
            }
        },
        clearCookies:function () {
            var self = this;
            try {
                this.page.clearCookies();
                this.response.statusCode = 200;
                this.response.write(true);
                this.response.close();
            } catch (ex) {
                self.response.statusCode = 500;
                self.response.write(ex.toString());
                self.response.close();
            }
        },
        deleteCookie:function (cookieName) {
            var self = this;
            try {
                var result = this.page.deleteCookie(cookieName);
                this.response.statusCode = 200;
                this.response.write(result);
                this.response.close();
            } catch (ex) {
                self.response.statusCode = 500;
                self.response.write(ex.toString());
                self.response.close();
            }
        },
        render:function (filename) {
            var self = this;
            try {
                var result = this.page.render.call(self.page, filename);
                this.response.statusCode = 200;
                this.response.write(result);
                this.response.close();
            } catch (ex) {
                self.response.statusCode = 500;
                self.response.write(ex.toString());
                self.response.close();
            }
        },
        renderBase64:function (format) {
            var self = this;
            try {
                var result = this.page.renderBase64.call(self.page, format);
                self.response.statusCode = 200;
                self.response.write(result);
                self.response.close();
            } catch (ex) {
                self.response.statusCode = 500;
                self.response.write(ex.toString());
                self.response.close();
            }
        },
        bindEvents:function (server) {
            var page = this.page;

            page.onAlert = function (message) {
                var event = {
                    source:'alert',
                    args:
                        [
                            message
                        ]
                };
                server.emit('page', event);
            };
            page.onCallback = function (data) {
                var event = {
                    type:'callback',
                    args:
                        [
                            data
                        ]
                };

                server.emit('page', event);
            };
            page.onClosing = function (closingPage) {
                var event = {
                    type:'closing',
                    args:
                        [
                            closingPage
                        ]
                };
                server.emit('page', event);
            };

            page.onConfirm = function (msg) {
                var event = {
                    type:'confirm',
                    args:
                        [
                            msg
                        ]
                };
                server.emit('page', event);

                // Allow user specified return function to return true / false
                // which corresponds to accept / deny confirm box
                if(page.onConfirmCallback) {
                    return page.onConfirmCallback.apply(page, arguments);
                }
            };
            //TODO:capture msg, linenum parms
            page.onConsoleMessage = function (msg, lineNum, typeId) {
                var event = {
                    type:'consoleMessage',
                    args:
                        [
                            msg,
                            lineNum,
                            typeId
                        ]
                };
                server.emit('page', event);
            };
            page.onError = function (msg, trace) {
                var event = {
                    type:'error',
                    args:
                        [
                            msg,
                            trace
                        ]
                };
                server.emit('page', event);
            };
            page.onInitialized = function () {
                var event = {
                    type:'initialized',
                    args:
                        [
                        ]
                };
                server.emit('page', event);
            };
            page.onLoadFinished = function (status) {
                var event = {
                    type:'loadFinished',
                    args:
                        [
                            status
                        ]
                };
                server.emit('page', event);
            };
            page.onLoadStarted = function () {
                var event = {
                    type:'loadStarted',
                    args:
                        [

                        ]
                };
                server.emit('page', event);
            };
            page.onResourceRequested = function (response) {
                var event = {
                    type:'resourceRequested',
                    args:
                        [
                            response
                        ]
                };
                server.emit('page', event);
            };
            page.onResourceReceived = function (response) {
                var event = {
                    type:'resourceReceived',
                    args:
                        [
                            response
                        ]
                };
                server.emit('page', event);
            };
            page.onNavigationRequested = function (url, type, willNavigate, main) {
                var event = {
                    type:'navigationRequested',
                    args:
                        [
                            url,
                            type,
                            willNavigate,
                            main
                        ]
                };
                server.emit('page', event);
            };
            page.onPageCreated = function (newPage) {
                var event = {
                    type:'pageCreated',
                    args:
                        [
                            newPage
                        ]
                };
                server.emit('page', event);
            };
//            this.page.onRetypeRequested = function (request) {
//                var event = {
//                    type:'retypeRequested',
//                    args:
//                        [
//                            request.url
//                        ]
//                };
//                logEvent(event);
//            };
            page.onRetypeReceived = function (response) {
                var event = {
                    type:'retypeReceived',
                    args:
                        [
                            response.url
                        ]
                };
                server.emit('page', event);
            };
            page.onUrlChanged = function (page) {
                var event = {
                    type:'urlChanged',
                    args:
                        [
                            page
                        ]
                };
                server.emit('page', event);
            };
        }
    };
}(module));
