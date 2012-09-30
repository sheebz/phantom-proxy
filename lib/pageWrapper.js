module.exports = {
    create:function () {
        this.page = require('webpage').create();
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
            var message = {
                source:'onConfirm',
                data:{
                    message:message
                }
            };
            console.log(JSON.stringify(message));
        };
        //This callback is invoked when there is a JavaScript console. The callback may accept up to three arguments: the string for the message,
        // the line number, and the source identifier.
        this.page.onConsoleMessage = function (string, line, sourceId) {
            var message = {
                source:'onConsoleMessage',
                data:{
                    string:string,
                    line:line,
                    sourceId:sourceId
                }
            };
            console.log(JSON.stringify(message));
        };
        //This callback is invoked when there is a JavaScript execution error. It is a good way to catch problems when evaluating a script in the
        // web page context. The arguments passed to the callback are the error message and the stack trace (as an array).
        this.page.onError = function (error, stack) {
            var message = {
                source:'onError',
                data:{
                    error:JSON.stringify(error),
                    stack:JSON.stringify(stack)
                }
            };
            console.log(JSON.stringify(message));
        };
        //This callback is invoked after the web page is created and before a URL is loaded. The callback may be used to change global objects.
        this.page.onInitialized = function () {
            var message = {
                source:'onInitialized'
            };
            console.log(JSON.stringify(message));
        };
        // This callback is invoked when the page finishes the loading. It may accept an argument status which equals to "success" if there is
        // no error and "failed" is error has occurred.
        this.page.onLoadFinished = function (status) {
            var message = {
                source:'onLoadFinished',
                data:{
                    status:status
                }
            };
            console.log(JSON.stringify(message));
        };
        //This callback is invoked when the page starts the loading. There is no argument passed to the callback.
        this.page.onLoadStarted = function () {
            var message = {
                source:'onLoadStarted'
            };
            console.log(JSON.stringify(message));
        };
        //This callback is invoked when there is a JavaScript prompt. The arguments passed to the callback are the string for the message and the
        // default value for the prompt answer. The return value of the callback handler should be a string.
        this.page.onPrompt = function (msg, defaultValue) {
            var message = {
                source:'onPrompt', data:{
                    message:msg,
                    defaultValue:defaultValue
                }
            };
            console.log(JSON.stringify(message));
        };
//        //This callback is invoked when the page requests a resource. The only argument to the callback is the request object.
//        this.page.onResourceRequested = function (request) {
//            var message = {
//                source:'onResourceRequested',
//                data:{request:JSON.stringify(request)}
//            };
//            console.log(JSON.stringify(message));
//        };
        // This callback is invoked when the a resource requested by the page is received. The only argument to the callback is the request object.
//        this.page.onResourceReceived = function (request) {
//            var message = {
//                source:'onResourceReceived',
//                data:{request:JSON.stringify(request)}
//            };
//            console.log(JSON.stringify(message));
//        };
        // If the resource is large and sent by the server in multiple chunks, onResourceReceived will be invoked for every chunk received by PhantomJS.
        this.page.onUrlChanged = function () {
            var message = {
                source:'onUrlChanged'
            };
            console.log(JSON.stringify(message));
        };
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
        this.response.body = result;
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
            self.response.write('done');
            self.response.close();
        });
    },
    render:function (filename) {
        var self = this;
        var result = self.page.render.call(self.page, filename);
        self.response.statusCode = 200;
        self.response.write(result);
        self.response.close();
    },
    renderBase64:function (format) {
        var self = this;
        var result = self.page.renderBase64.call(self.page, format);
        self.response.statusCode = 200;
        self.response.write(result);
        self.response.close();
    }
};

