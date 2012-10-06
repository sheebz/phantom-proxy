(function (module) {
    'use strict';
    var request = require('./request/main');
    module.exports = {

//properties
        //sets property value ex. viewportSize
        set:function (propertyName, propertyValue, callbackFn) {
            var self = this;
            request.post('http://localhost:1061/page/properties/set', {
                    form:{
                        propertyName:propertyName,
                        propertyValue:JSON.stringify(propertyValue, null, 4)
                    }
                },
                function (error, response, body) {
                    if (response.statusCode === 200) {
                        callbackFn && callbackFn.call(self, !!body);
                    }
                    else {
                        console.error(body);
                        throw new Error(body);
                    }
                });
        },
        //functions
        //creates instance of webpage process
        create:function (phantomProcess) {
            this.phantomProcess = phantomProcess;

            this.phantomProcess.stdout.on('data', function (data) {
                var msg = data.toString(),
                    event = undefined;

                try {
                    event = JSON.parse(msg);
                    this[event.source] && this[event.source].call(this, event);
                } catch (ex) {
                    console.log(msg);
                }
            });

            return this;
        },
        //Opens the URL and loads it to the page. Once page is loaded, the optional callback is called using onLoadFinished,
        // and also provides the page status to the function ('success' or 'fail').
        open:function (url, callbackFn) {
            var self = this;
            request.post('http://localhost:1061/page/functions/open', {form:{ arguments:JSON.stringify(
                    [
                        url
                    ], null, 4)}},
                function (error, response, body) {

                    console.log('open ' + body);
                    error && console.error(error);
                    if (response && response.statusCode === 200) {
                        body === 'success' ?
                            callbackFn && callbackFn.call(self, true) : callbackFn && callbackFn.call(self, false);
                    }
                    else {
                        console.error(body);
                        throw new Error(body);
                    }
                }
            );
        },
        //Evaluates the given function in the context of the web page.
        // The execution is sandboxed, the web page has no access to the phantom object and it can't probe its own setting.
        evaluate:function (expressionFn, callbackFn) {
            var self = this;
            request.post('http://localhost:1061/page/functions/evaluate', {
                    form:{expressionFn:expressionFn.toString(), arguments:JSON.stringify(Array.prototype.slice.call(arguments, 2, arguments.length), null, 4)}
                },
                function (error, response, body) {
                    if (response.statusCode === 200) {
                        callbackFn && callbackFn.call(self, body);
                    }
                    else {
                        console.error(body);
                        throw new Error(body);
                    }
                });
        },
        //Renders the web page to an image buffer and save it as the specified file.
        // Currently the output format is automatically set based on the file extension. Supported formats are PNG, GIF, JPEG, and PDF.
        render:function (filename, callbackFn) {
            var self = this;
            request.post('http://localhost:1061/page/functions/render', {form:{ arguments:JSON.stringify(
                    [
                        filename
                    ], null, 4)}},
                function (error, response, body) {
                    if (response.statusCode === 200) {
                        callbackFn && callbackFn.call(self, !!body);
                    }
                    else {
                        console.error(body);
                        throw new Error(body);
                    }
                }
            );
        },
        //Renders the web page to an image buffer and returns the result as a base64-encoded string representation of that image.
        // Supported formats are PNG, GIF, and JPEG.
        renderBase64:function (format, callbackFn) {
            var self = this;
            request.post('http://localhost:1061/page/functions/renderBase64', {form:{ arguments:JSON.stringify(
                    [
                        format
                    ], null, 4)}},
                function (error, response, body) {
                    if (response.statusCode === 200) {
                        callbackFn && callbackFn.call(self, !!body);
                    }
                    else {
                        console.error(body);
                        throw new Error(body);
                    }
                });
        },
        //additional methods not in phantomjs api
        //waits for selector to appear, then executes callbackFn
        waitForSelector:function (selector, callbackFn, timeout) {
            timeout = timeout || 1000;
            var self = this;
            this.evaluate(function (selectorToEvaluate) {
                return document.querySelectorAll(selectorToEvaluate).length;
            }, function (result) {
                if (result == 0) {
                    try {
                        setTimeout.call(self,
                            (function () {
                                self.waitForSelector(selector, callbackFn);
                            }(self))
                            , 200);
                    }
                    catch (error) {
                        console.error(error);
                    }
                }
                else {
                    callbackFn();
                }
            }, selector);
        }
    }
}(module));
