(function (module, process) {
    'use strict';
    var colors = require('colors'),
        request = require('./request/main'),
        _ = require('underscore'),
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

    var translateOptions2Arguments = function (options) {
        //used to translate property to cmd line arg
        var argMap = {
            'ignoreSslErrors':'ignore-ssl-errors',
            'localToRemoteUrlAccessEnabled':'local-to-remote-url-access',
            'cookiesFile':'cookies-file',
            'diskCache':'disk-cache',
            'loadImages':'load-images',
            'maxDiskCache':'max-disk-cache',
            'outputEncoding':'output-encoding',
            'proxy':'proxy',
            'proxyType':'proxy-type',
            'scriptEncoding':'script-encoding',
            'version':'version',
            'webSecurity':'web-security',
            'port':'port'
        };

        //may integrate in future
        var defaultoptions = {
            'ignoreSslErrors':true,
            'localToRemoteUrlAccessEnabled':true,
            'cookiesFile':'cookies.txt',
            'diskCache':'yes',
            'loadImages':'yes',
            'localToRemoteUrlAccess':'no',
            'maxDiskCache':'50000',
            'outputEncoding':'utf8',
            'proxy':'0',
            'proxyType':'yes',
            'scriptEncoding':'yes',
            'webSecurity':'yes',
            'port':1061
        };

        //map options props to cmd line args for phantom process
        return Object.keys(options).map(function (value) {
            return '--' + argMap[value] + '=' + options[value];
        });

    };

    //on exit loop through process array and kill everything
    process.on('exit', function () {
        processArray.forEach(function (proc) {
            proc.kill('SIGHUP');
        });
    });

    //closures
    //----

    var processArray =
            [
            ], //holds references to any spawned phantomjs procs
        WebPage = require('./webpage'),
        phantom = require('./phantom'),
        phantomProcess, //current phantomjs process

    //creates a new phantomjs process
        createServer = function (options, callbackFn) {
            var starting = true,
                spawn = require('child_process').spawn,
                serverPath = __dirname + '/' + require('path').normalize('./server/webserver.js');

            var processArgs = translateOptions2Arguments(options);

            processArgs.unshift(JSON.stringify(options));
            processArgs.unshift(serverPath);

            //spawn new process
            phantomProcess =
                spawn('phantomjs',
                    processArgs,
                    {
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
        pingServer = function (options, callbackFn) {

            var self = this;
            request.get('http://localhost:' + options.port + '/ping',
                function (error, response) {

                    if (response && response.statusCode === 200) {    //server up

                        callbackFn && callbackFn.call(self, true);
                    }
                    else {    //server down
                        callbackFn.call(self, false);
                    }
                });
            return this;
        },
        killServer = function () {
            return phantomProcess && phantomProcess.kill('SIGHUP');
        },
    //starts phantom's embedded webserver for communication channel
    //may want change the way we create server at some point
        startServer = function (options, callbackFn) {

            //check to see if server is up -- shouldn't be, but
            pingServer(options, function (result) {
                if (!result) {
                    //if server down (expected), create server
                    createServer(options, function (phantomProcess) {
                        callbackFn(phantomProcess);
                    });
                }
                else {//if server is up - from previous problem?  just continue?
                    console.log('server running already'.red);
                    //ping will call exit function, so try again, hopefully process is gone
                    startServer.call(this, options, callbackFn);
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

            //assign default port
            options.port = options.port || 1061;

            //try starting server
            startServer(options, function (phantomProcess) {
                self.page = new WebPage(options, phantomProcess);
                self.phantom = phantom.create(options, phantomProcess);
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

