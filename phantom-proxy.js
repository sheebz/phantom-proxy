var request = require('request'),
    _ = require('underscore'),
    Q = require('Q');

var phantomProxy = _.extend({}, {
    createProxy:function (options, callbackFn) {
        options = options || {};
        var self = this;
        this.startServer(options.port, function () {
            console.log('server started pid:' + self.phantomjsProc.pid);
            self.page = webpageInterface;
            self.phantom = phantomInterface;
            callbackFn({
                page:self.page,
                phantom:self.phantom
            });
        });
    },
    destroy:function () {
        console.log('killing process');
        this.phantomjsProc && this.phantomjsProc.kill('SIGHUP');
    },
    startServer:function (port, callbackFn) {
        var eventEmitter = require('events').EventEmitter,
            self = this,
            starting = true,
            fs = require('fs'),
            spawn = require('child_process').spawn,
            out = fs.openSync('./out.log', 'a'),
            err = fs.openSync('./out.log', 'a');

        this.phantomjsProc =
            spawn('phantomjs',
                [
                    'phantomServer.js'
                ], {
                    detached:true,
                    stdio:
                        [
                            'pipe',
                            'pipe',
                            process.stderr
                        ]
                });

        this.phantomjsProc.unref();
        this.phantomjsProc.stdout.on('data', function (data) {

            var msg = data.toString();
            console.log(msg);
            try {
                var event = JSON.parse(msg);
                self.page && self.page[event.source] && self.page[event.source].call(self.page, event);
            }
            catch (error) {
                console.error(error);
            }
//            //eventEmitter.emit('dataReceived', data.toString());
//            try {
//
//                console.log(msg);
//                var event = JSON.parse(msg);
//                self.page && self.page[event.source] && self.page[event.source].call(self.page, event);
//            } catch (error) {
//                console.log(error);
//            }

            if (starting) {
                if (msg == 0) {
                    starting = false;
                    callbackFn();
                }
                else {
                    self.phantomjsProc.kill();
                    throw new Error('unable to start server');
                }
            }

        });
//        var starting = true;
//        port = port || 1061;
//        var cp = require('child_process'),
//            phantomjsProc = cp.spawn('phantomjs',
//                [
//                    'phantomServer.js'
//                ]);
//
//        this.phantomjsProc = phantomjsProc;
//
//        var pingService = function (callbackFn) {
//            console.log('pinging...');
//            request.get('http://locahost:1061/ping', function (error, response, body) {
//                console.log(JSON.stringify(response));
//                callbackFn();
//            });
//        };
//
//        phantomjsProc.stdout.on('data', function (data) {
//            var msg = data.toString();
//            console.log('** ' + data.toString() + '**');
//
//            if (starting) {
//                if (msg == 0) {
//                    starting = false;
//                    callbackFn();
//                }
//                else {
//                    phantomjsProc.kill();
//                    throw new Error('unable to start server');
//                }
//            }
//
//        });
//
//        phantomjsProc.stderr.on('data', function (data) {
//            console.log('stderr: ' + data.toString());
//        });
//
//        phantomjsProc.on('exit', function (code) {
//            console.log('child process exited with code ' + code);
//        });
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
    exit:function (returnValue, callbackFn) {
        request.post('http://localhost:1061/phantom/functions/exit', {form:{ arguments:JSON.stringify(
                [
                    returnValue
                ], null, 4)}},
            function (error, response, body) {
                callbackFn && callbackFn.call(this, body);
            });
    },
    injectJs:function (filename, callbackFn) {
        request.post('http://localhost:1061/phantom/functions/injectJs', {form:{arguments:JSON.stringify(arguments)}},
            callbackFn);
    }
});

var webpageInterface = {
    destroy:function () {

    },
    createServer:function (port, callbackFn) {
        port = port || 1061;
        console.log('creating server');
        var spawn = require('child_process').spawn,
            phantomjs = spawn('phantomjs',
                [
                    'phantomServer.js'
                ]);

        phantomjs.stdout.on('data', function (data) {
            if (data == 1) {
                callbackFn();
            }
        });

        phantomjs.stderr.on('data', function (data) {
            console.log('stderr: ' + data);
        });

        phantomjs.on('exit', function (code) {
            console.log('child process exited with code ' + code);
        });
    },

//properties
    set:function (property, value, callbackFn) {
        request.post('http://localhost:1061/page/properties/set', {form:{propertyName:property, propertyValue:JSON.stringify(value)}},
            function (error, response, body) {
                callbackFn.call(this);
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
                callbackFn && callbackFn();
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
                callbackFn(body);
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
