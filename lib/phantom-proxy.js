(function (exports) {
    "use strict";

    var request = require('./request/main'),
        _ = require('underscore'),
        Q = require('q'),
        qs = require('querystring');

    var phantomProcess = undefined;

    var phantomProxy = _.extend({}, {
        createProxy:function (options, callbackFn) {
            options = options || {};
            var self = this;
            this.startServer(options.port, function () {
                self.page = webpageInterface;
                self.phantom = phantomInterface;
                callbackFn({
                    page:self.page,
                    phantom:self.phantom
                });
            });
        },
        ping:function (callbackFn) {
            var self = this;
            callbackFn.call(self, false);
            return;

            console.log('pinging service');
            request.get('http://localhost:1061/ping', function (error, response, body) {
                if (response && response.statusCode == 200) {
                    callbackFn.call(self, true);
                } else {
                    callbackFn.call(self, false);
                }
            });
        },
        startServer:function (port, callbackFn) {
            var self = this;
            this.ping(function (result) {
                if (!result) {
                    this.createServer(port, function () {
                        callbackFn();
                    });
                }
                else{
                    callbackFn();
                }
            });
        },
        createServer:function (port, callbackFn) {
            var
                self = this,
                starting = true,
                fs = require('fs'),
                spawn = require('child_process').spawn;

            var serverPath = __dirname + '/' + require('path').normalize('./phantomServer.js');

            phantomProcess =
                spawn('phantomjs',
                    [
                        serverPath
                    ], {
                        detached:false,
                        stdio:
                            [
                                'pipe',
                                'pipe',
                                'pipe'
                            ]
                    });

            //phantomProcess.unref();
            phantomProcess.on('exit', function (data) {
                console.log('exit called');
            });
            phantomProcess.on('SIGHUP', function () {
                console.log('Got SIGHUP signal.');
            });
            phantomProcess.stderr.on('data', function (data) {
                console.error(data.toString().red);
            });

            phantomProcess.stdout.on('data', function (data) {

                var msg = data.toString();
                try {
                    var event = JSON.parse(msg);
                    self.page && self.page[event.source] && self.page[event.source].call(self.page, event);
                }
                catch (error) {
                    console.log(msg);
                }

                if (starting) {
                    if (msg == 0) {
                        starting = false;
                        callbackFn();
                    }
                    else {
                        throw new Error('unable to start server');
                    }
                }
            });
        }
    });

    var phantomInterface = _.extend({}, {
        //properties
        set:function (propertyName, propertyValue, callbackFn) {
            request.post('http://localhost:1061/phantom/properties/set', {form:{ propertyName:propertyName, propertyValue:propertyValue}},
                function (error, response, body) {
                    callbackFn && callbackFn.call(this, body);
                });
        },
        get:function (propertyName, callbackFn) {
            request.post('http://localhost:1061/phantom/properties/get', {form:{ propertyName:propertyName}},
                function (error, response, body) {
                    callbackFn && callbackFn.call(this, body);
                });
        },
        //functions
        exit:function (callbackFn) {
//            request.post('http://localhost:1061/phantom/functions/exit', {form:{ arguments:JSON.stringify(
//                    [
//                        0
//                    ], null, 4)}},
//                function (error, response, body) {
//                    callbackFn && callbackFn.call(this, body);
//                });
            phantomProcess.kill('SIGHUP');
            callbackFn();
        },
        injectJs:function (filename, callbackFn) {
            request.post('http://localhost:1061/phantom/functions/injectJs', {form:{arguments:JSON.stringify(arguments)}},
                callbackFn);
        }
    });

    var webpageInterface = {

//properties
        set:function (property, value, callbackFn) {
            request.post('http://localhost:1061/page/properties/set', {form:{propertyName:property, propertyValue:JSON.stringify(value)}},
                function (error, response, body) {
                    callbackFn && callbackFn.call(this, body);
                });
        },
        open:function (url, callbackFn) {
            var deferred = Q.defer();
            request.post('http://localhost:1061/page/functions/open', {form:{ arguments:JSON.stringify(
                    [
                        url
                    ], null, 4)}},
                function (error, response, body) {
                    deferred.resolve(body);
                    callbackFn && callbackFn.call(this, body);
                }
            );
            return deferred.promise;
        },
        evaluate:function (expressionFn, callbackFn) {
            var self = this;
            request.post('http://localhost:1061/page/functions/evaluate', {
                    form:{expressionFn:expressionFn.toString(), arguments:JSON.stringify(Array.prototype.slice.call(arguments, 2, arguments.length), null, 4)}
                },
                function (error, response, body) {
                    callbackFn && callbackFn.call(this, body);
                });
        },
        render:function (filename, callbackFn) {
            request.post('http://localhost:1061/page/functions/render', {form:{arguments:JSON.stringify(arguments)}}, callbackFn);
        },
        renderBase64:function (format, callbackFn) {
            request.post('http://localhost:1061/page/functions/renderBase64', {form:{ arguments:JSON.stringify(
                    [
                        format
                    ], null, 4)}},
                function (error, response, body) {
                    callbackFn && callbackFn.call(this, body);
                });
        },
        //additional methods not in phantomjs api
        waitForSelector:function (selector, callbackFn) {
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
    };
    module.exports = phantomProxy;
}(module.exports));
