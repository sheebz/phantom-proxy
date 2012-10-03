(function () {
    module.exports = {
        create:function () {
            this.page = require('webpage').create();
            this.bindEvents();
            return this;
        },
        setProperty:function (propertyName, propertyValue) {
            this.page[propertyName] = JSON.parse(propertyValue);
            this.response.write('ok');
            this.response.statusCode = 200;
            this.response.close();
        },
        getProperty:function (propertyName) {
            var result = this.page[propertyName];
            this.response.write(result);
            this.response.statusCode = 200;
            this.response.close();
        },
        setResponse:function (response) {
            this.response = response;
        },
        evaluate:function () {
            var self = this;
            var result = self.page.evaluate.apply(self.page, arguments);

            self.response.statusCode = 200;
            self.response.write(result);
            self.response.close();
        },
        open:function (url) {
            var self = this;
            this.page.open.call(self.page, url, function (status) {
                self.response.statusCode = 200;
                self.response.write(status);
                self.response.close();
            });
        },
        render:function (filename) {

            var result = this.page.render.call(self.page, filename);
            this.response.statusCode = 200;
            this.response.write(result);
            this.response.close();
        },
        renderBase64:function (format) {
            var result = this.page.renderBase64.call(self.page, format);
            self.response.statusCode = 200;
            self.response.write(result);
            self.response.close();
        },
        bindEvents:function () {
            //This callback is invoked when there is a JavaScript alert. The only argument passed to the callback is the string for the message.
            this.page.onAlert = function (message) {
                var message = {
                    source:'onAlert',
                    data:{
                        message:message
                    }
                };
                console.log(JSON.stringify(message));
            };
            //This callback is invoked when there is a JavaScript confirm.
            // The only argument passed to the callback is the string for the message. The return value of the callback handler can be either true or false.
            this.page.onConfirm = function (message) {
                var event = {
                    source:'onConfirm',
                    data:{
                        message:message
                    }
                };
                console.log(JSON.stringify(event));
            };
            //This callback is invoked when there is a JavaScript console. The callback may accept up to three arguments: the string for the message,
            // the line number, and the source identifier.
            this.page.onConsoleMessage = function (string, line, sourceId) {
                var event = {
                    source:'onConsoleMessage',
                    data:{
                        string:string,
                        line:line,
                        sourceId:sourceId
                    }
                };
                console.log(JSON.stringify(event));
            };
            //This callback is invoked when there is a JavaScript execution error. It is a good way to catch problems when evaluating a script in the
            // web page context. The arguments passed to the callback are the error message and the stack trace (as an array).
            this.page.onError = function (error, stack) {
                var event = {
                    source:'onError',
                    data:{
                        error:JSON.stringify(error),
                        stack:JSON.stringify(stack)
                    }
                };
                console.log(JSON.stringify(event));
            };
            //This callback is invoked after the web page is created and before a URL is loaded. The callback may be used to change global objects.
            this.page.onInitialized = function () {
                var event = {
                    source:'onInitialized'
                };
                console.log(JSON.stringify(event));
            };
            // This callback is invoked when the page finishes the loading. It may accept an argument status which equals to "success" if there is
            // no error and "failed" is error has occurred.
            this.page.onLoadFinished = function (status) {
                var event = {
                    source:'onLoadFinished',
                    data:{
                        status:status
                    }
                };
                console.log(JSON.stringify(event));
            };
            //This callback is invoked when the page starts the loading. There is no argument passed to the callback.
            this.page.onLoadStarted = function () {
                var event = {
                    source:'onLoadStarted'
                };
                console.log(JSON.stringify(event));
            };
            //This callback is invoked when there is a JavaScript prompt. The arguments passed to the callback are the string for the message and the
            // default value for the prompt answer. The return value of the callback handler should be a string.
            this.page.onPrompt = function (msg, defaultValue) {
                var event = {
                    source:'onPrompt', data:{
                        message:msg,
                        defaultValue:defaultValue
                    }
                };
                console.log(JSON.stringify(event));
            };
            //This callback is invoked when the page requests a resource. The only argument to the callback is the request object.
            this.page.onResourceRequested = function (request) {
                var event = {
                    source:'onResourceRequested',
                    data:request
                };
                console.log(JSON.stringify(event));
            };

            this.page.onResourceReceived = function (request) {
                var event = {
                    source:'onResourceReceived',
                    data:request
                };
                console.log(JSON.stringify(event));
            };
            // If the resource is large and sent by the server in multiple chunks, onResourceReceived will be invoked for every chunk received by PhantomJS.
            this.page.onUrlChanged = function () {
                var event = {
                    source:'onUrlChanged'
                };
                console.log(JSON.stringify(event));
            };
        }
    };
}());
