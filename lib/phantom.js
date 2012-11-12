(function (module) {
    'use strict';

    var util = require('util'),
        request = require('./request/main'),
        _ = require('underscore'),
        events = require('events'),
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
                    if (response && response.statusCode === 200 && body === 'true' || body === 'success') {
                        callbackFn && callbackFn.call(self, true);
                    }
                    else {
                        console.log('error in response %s'.red.bold, body);
                        callbackFn && callbackFn.call(self, false, body);
                    }
                });
        };

    var Phantom = function (options) {
        var self = this;
        this.options = options;
        this.options.debug && console.log('creating phantom proxy instance with options %s', JSON.stringify(options));
        events.EventEmitter.call(this);

        _.extend(this, {
            addCookie:function (cookie, callbackFn) {
                executeMethod.call(this, '/phantom/functions/addCookie', callbackFn, cookie);
                return this;
            },
            clearCookies:function (callbackFn) {
                executeMethod.call(this, '/phantom/functions/clearCookies', callbackFn);
            },
            deleteCookie:function (cookieName, callbackFn) {
                executeMethod.call(this, '/phantom/functions/deleteCookie', callbackFn, cookieName);
            },
            exit:function (returnValue, callbackFn) {
                executeMethod.call(this, '/phantom/functions/exit', callbackFn, returnValue);
            },
            //system calls
            args:function (callbackFn) {
                var self = this;
                request.post(this.options.hostAndPort + '/phantom/functions/args', {
                        form:{
                        }
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
            //properties
            //sets property
            set:function (propertyName, propertyValue, callbackFn) {
                var self = this;
                request.post(this.options.hostAndPort + '/phantom/properties/set', {
                        form:{
                            propertyName:propertyName,
                            propertyValue:JSON.stringify(propertyValue, null, 4)
                        }
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
            //gets property value ex. version
            get:function (propertyName, callbackFn) {
                var self = this;

                request.post(this.options.hostAndPort + '/phantom/properties/get', {form:{ propertyName:propertyName}},
                    function (error, response, body) {
                        error && console.error(error);
                        if (response && response.statusCode === 200 ) {
                            callbackFn && callbackFn.call(self, JSON.parse(body));
                        }
                        else {
                            console.log('error in response %s'.red.bold, body);
                            callbackFn && callbackFn.call(self, false, body);
                        }
                    });
            },
            //Injects external script code from the specified file. If the file can not be found in the current directory, libraryPath is used for additional look up.
            //  This function returns true if injection is successful, otherwise it returns false.
            injectJs:function (filename, callbackFn) {
                var self = this;
                request.post(this.options.hostAndPort + '/phantom/functions/injectJs', {form:{args:JSON.stringify(arguments)}},
                    function (error, response, body) {
                        if (response.statusCode === 200) {
                            callbackFn && callbackFn.call(self, body);
                        }
                        else {
                            console.error(body);
                            throw new Error(body);
                        }
                    });
            }
        });

    };
    util.inherits(Phantom, events.EventEmitter);
    module.exports = Phantom;

}(module));
