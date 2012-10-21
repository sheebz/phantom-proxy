/*global  module:false, console:false, require:false*/
(function (module) {
    'use strict';
    module.exports = {
        create:function () {
            this.page = require('webpage').create();
            this.bindEvents();
            return this;
        },
        setProperty:function (propertyName, propertyValue) {
            var self = this;
            try {
                this.page[propertyName] = JSON.parse(propertyValue);
                this.response.write('true');
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
                this.response.write(result);
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
        open:function (url) {
            var self = this;
            try {
                this.page.open.call(self.page, url, function (status) {
                    self.response.statusCode = 200;
                    self.response.write(status);
                    self.response.close();
                });
            } catch (exception) {
                self.response.statusCode = 500;
                self.response.write(exception.toString());
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
        bindEvents:function () {
            var logEvent = function (eventArg) {
                try{
                    eventArg && console.log(JSON.stringify(eventArg) + '#END-EVENT');
                }
                catch(ex){

                }
            };

            this.page.onAlert = function (message) {
                var event = {
                    source:'alert',
                    args:
                        [
                            message
                        ]
                };
                logEvent(event);
            };
            this.page.onCallback = function (data) {
                var event = {
                    source:'callback',
                    args:
                        [
                            data
                        ]
                };

                logEvent(event);
            };
            this.page.onClosing = function (closingPage) {
                var event = {
                    source:'closing',
                    args:
                        [
                            closingPage
                        ]
                };
                logEvent(event);
            };

            this.page.onConfirm = function (msg) {
                var event = {
                    source:'confirm',
                    args:
                        [
                            msg
                        ]
                };
                logEvent(event);
            };
            //TODO:capture msg, linenum parms
            this.page.onConsoleMessage = function (msg, lineNum, sourceId) {
                var event = {
                    source:'consoleMessage',
                    args:
                        [
                            msg,
                            lineNum,
                            sourceId
                        ]
                };
                logEvent(event);
            };
            this.page.onError = function (msg, trace) {
                var event = {
                    source:'error',
                    args:
                        [
                            msg,
                            trace
                        ]
                };
                logEvent(event);
            };
            this.page.onInitialized = function () {
                var event = {
                    source:'initialized',
                    args:
                        [
                        ]
                };
                logEvent(event);
            };
            this.page.onLoadFinished = function (status) {
                var event = {
                    source:'loadFinished',
                    args:
                        [
                            status
                        ]
                };
                logEvent(event);
            };
            this.page.onLoadStarted = function () {
                var event = {
                    source:'loadStarted',
                    args:
                        [

                        ]
                };
                logEvent(event);
            };
            this.page.onNavigationRequested = function (url, type, willNavigate, main) {
                var event = {
                    source:'navigationRequested',
                    args:
                        [
                            url,
                            type,
                            willNavigate,
                            main
                        ]
                };
                logEvent(event);
            };
            this.page.onPageCreated = function (newPage) {
                var event = {
                    source:'pageCreated',
                    args:
                        [
                            newPage
                        ]
                };
                logEvent(event);
            };
//            this.page.onResourceRequested = function (request) {
//                var event = {
//                    source:'resourceRequested',
//                    args:
//                        [
//                            request.url
//                        ]
//                };
//                logEvent(event);
//            };
            this.page.onResourceReceived = function (response) {
                var event = {
                    source:'resourceReceived',
                    args:
                        [
                            response.url
                        ]
                };
                logEvent(event);
            };
            this.page.onUrlChanged = function (page) {
                var event = {
                    source:'urlChanged',
                    args:
                        [
                            page
                        ]
                };
                logEvent(event);
            };
        }
    };
}(module));
