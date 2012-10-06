(function (module, process) {
    'use strict';
    var colors = require('colors'),
        request = require('./request/main');

    colors.setTheme({
        silly:'rainbow',
        input:'grey',
        verbose:'cyan',
        prompt:'grey',
        info:'green',
        data:'grey',
        help:'cyan',
        warn:'yellow',
        debug:'blue',
        error:'red'
    });

    process.on('exit', function () {
        processArray.forEach(function (proc) {
            proc.kill('SIGHUP');
        });
    });

    var processArray =
            [
            ],
        webpage = require('./webpage'),
        phantom = require('./phantom'),
        phantomProcess,

    //creates a new phantomjs process
        createServer = function (port, callbackFn) {
            console.log('creating server process'.info);
            var self = this,
                starting = true,
                fs = require('fs'),
                spawn = require('child_process').spawn,
                serverPath = __dirname + '/' + require('path').normalize('./server/webserver.js');

            console.log(('spawning phantom js process with argument ' + serverPath).info);

            phantomProcess =
                spawn('phantomjs',
                    [
                        serverPath
                    ], {
                        detached:true,
                        stdio:
                            [
                                'pipe',
                                'pipe',
                                'pipe'
                            ]
                    });

            phantomProcess.unref();

            processArray.push(phantomProcess);

            phantomProcess.stderr.on('data', function (data) {
                console.error(data.toString().red);
            });

            phantomProcess.stdout.on('data', function (data) {
                var msg = data.toString();

                if (starting) {
                    console.log(msg);
                    if (msg == 0) {
                        starting = false;
                        callbackFn(phantomProcess);
                    }
//                    else {
//                        console.log('unable to start server'.error);
//                        self.killServer();
//                        throw new Error('unable to start server');
//                    }
                }
            });
        },
        pingServer = function (callbackFn) {
            var self = this;
            request.get('http://localhost:1061/ping',
                function (error, response, body) {
                    error && console.error(error);
                    if (response && response.statusCode === 200) {
                        callbackFn && callbackFn.call(self, true);
                    }
                    else {
                        console.error(error);
                        callbackFn.call(self, false);
                    }
                });
            return this;
        },
        killServer = function () {
            return phantomProcess && phantomProcess.kill('SIGHUP');
        },
        startServer = function (port, callbackFn) {
            console.log('starting server'.info);
            pingServer(function (result) {
                if (!result) {
                    createServer(port, function (phantomProcess) {
                        console.log('created new server'.info);
                        callbackFn(phantomProcess);
                    });
                }
                else {
                    console.log('server running already'.info);
                    callbackFn();
                }
            });
        };

    module.exports = {
        end:function () {
            killServer();
            this.page = undefined;
            this.phantom = undefined;
        },
        create:function (options, callbackFn) {
            var self = this;

            if (typeof options === 'function') {
                console.log(options);
                callbackFn = options;
                options = {};
            }

            startServer(options.port, function (phantomProcess) {
                self.page = webpage.create(phantomProcess);
                self.phantom = phantom.create(phantomProcess);
                var proxy = {
                    page:self.page,
                    phantom:self.phantom
                };
                callbackFn.call(self, proxy);
            });
            return this;
        }
    }
}(module, process));

