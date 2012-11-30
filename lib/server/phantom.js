/*global   require:false, phantom:false, module:false*/
(function (module, phantom) {
    'use strict';
    module.exports = {
        create:function (server) {
            this.server = server;
            //add global error handling
            this.bindEvents(server);
            return this;
        },
        setResponse:function (response) {
            this.response = response;
        },
        exit:function (returnCode) {
            this.response.statusCode = 200;
            this.response.write(true);
            this.response.close();
            phantom.exit(returnCode);
            this.server.emit('phantom', {
                type:'exited',
                args:
                    [
                        returnCode
                    ]
            });
        },
        setProperty:function (propertyName, propertyValue) {
            var valueToSet;
            try {
                try {
                    valueToSet = JSON.parse(propertyValue);
                } catch (error) {
                    valueToSet = propertyValue;
                }
                phantom[propertyName] = valueToSet;
                this.response.write(JSON.stringify(phantom[propertyName]));
                this.response.statusCode = 200;
                this.response.close();

            } catch (ex) {
                this.response.statusCode = 500;
                this.response.write(ex);
                this.response.close();
            }
        },
        getProperty:function (propertyName) {
            try {
                var result;

                if (propertyName === 'args') {
                    result = JSON.stringify(require('system').args);
                }
                else {
                    result = JSON.stringify(phantom[propertyName], null, 4);
                }

                this.response.statusCode = 200;
                this.response.write(result);
                this.response.close();
            } catch (ex) {
                this.response.statusCode = 500;
                this.response.write(ex);
                this.response.close();
            }
        },
        addCookie:function (cookie) {
            var self = this;
            try {
                var result = phantom.addCookie(cookie);
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
                phantom.clearCookies();
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
                var result = phantom.deleteCookie(cookieName);
                this.response.statusCode = 200;
                this.response.write(result);
                this.response.close();
            } catch (ex) {
                self.response.statusCode = 500;
                self.response.write(ex.toString());
                self.response.close();
            }
        },
        bindEvents:function (server) {
            phantom.onError = function (msg, trace) {
                var event = {
                    type:'phantomError',
                    args:
                        [
                            msg,
                            trace
                        ]
                };
                server.emit('phantom', event);
            };
        }
    };
}(module, phantom));
