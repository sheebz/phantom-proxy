(function (module, process) {
    'use strict';
    var colors = require('colors'),
        request = require('./request/main'),
        Q = require('q');

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

    //on exit loop through process array and kill everything
    process.on('exit', function () {
        processArray.forEach(function (proc) {
            proc.kill('SIGHUP');
        });
    });

    //closures
    //----


    var processArray = [ ],//holds references to any spawned phantomjs procs
        webpage = require('./webpage'),
        phantom = require('./phantom'),
        phantomProcess,//current phantomjs process

    //creates a new phantomjs process
        createServer = function (port, callbackFn) {
            var starting = true,
                spawn = require('child_process').spawn,
                serverPath = __dirname + '/' + require('path').normalize('./server/webserver.js');

            //spawn new process
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

            phantomProcess.unref();

            processArray.push(phantomProcess);

            phantomProcess.stderr.on('data', function (data) {
                console.error(data.toString().error);
            });

            phantomProcess.stdout.on('data', function (data) {
                var msg = data.toString();

                if (starting) {
                    if (msg == 0) {
                        starting = false;
                        callbackFn(phantomProcess);
                    }
                }
            });
        },
    //use to see if  phantom server already runnings
        pingServer = function (callbackFn) {
            var self = this;
            request.get('http://localhost:1061/ping',
                function (error, response, body) {
                    if (response && response.statusCode === 200) {
                        callbackFn && callbackFn.call(self, true);
                    }
                    else {
                        callbackFn.call(self, false);
                    }
                });
            return this;
        },
        killServer = function () {
            return phantomProcess && phantomProcess.kill('SIGHUP');
        },
        startServer = function (port, callbackFn) {
            pingServer(function (result) {
                if (!result) {//if server down (expected), create server
                    createServer(port, function (phantomProcess) {
                        callbackFn(phantomProcess);
                    });
                }
                else {//if server is up - from previous problem?  just continue?
                    callbackFn();
                }
            });
        };

    module.exports = {
        //terminates phantomjs process
        end:function () {
            killServer();
            this.page = undefined;
            this.phantom = undefined;
        },
        //creates a new proxy session - creates phantomjs process and webserver module
        create:function (options, callbackFn) {
            var self = this;

            //compensate for optional options parm
            if (typeof options === 'function') {
                callbackFn = options;
                options = {};
            }

            //try starting server
            startServer(options.port, function (phantomProcess) {
                self.page = webpage.create(phantomProcess);
                self.phantom = phantom.create(phantomProcess);
                var proxy = {
                    page:self.page,
                    phantom:self.phantom
                };
                callbackFn.call(self, proxy);
            });
            return this;//return this to chain end
        }
    }
}(module, process));

