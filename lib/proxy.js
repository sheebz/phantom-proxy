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

//    //on exit loop through process array and kill everything
//    process.on('exit', function () {
//        processArray.forEach(function (proc) {
//            proc.kill('SIGHUP');
//        });
//    });

    //closures
    //----

    var processArray =
            [
            ], //holds references to any spawned phantomjs procs
        phantomProcess, //current phantomjs process

    //creates a new phantomjs process
        createServer = function (options, callbackFn) {

            var fs = require('fs'),
                filename = './events.txt',
                self = this,
                processEventFileChange = function (curr, prev) {

                    if (prev.mtime >= curr.mtime) {
                        return;
                    }

                    fs.readFile(filename, function (err, data) {
                        if (err) throw err;
                        var dataBuffer = data.toString();
                        try {

                            var parsedEvent = JSON.parse(dataBuffer);
                        }
                        catch (exception) {
                            console.log(exception.toString().red.bold);
                            return;
                        }

                        switch (parsedEvent.source) {
                            case 'server' :
                                options.debug && console.log('server created'.green);
                                var Webpage = require('./webpage'),
                                    page = new Webpage(options, phantomProcess),
                                    phantom = require('./phantom').create(options, phantomProcess);

                                self.proxy = {
                                    page:page,
                                    phantom:phantom,
                                    end:function (endCallback) {
                                        self.end(function () {
                                            endCallback(true);
                                        });
                                    }
                                };
                                callbackFn.call(self, self.proxy);
                                break;
                            default :
                                console.log(parsedEvent.source.blue);
                                var args = parsedEvent.args;
                                args.unshift(parsedEvent.source);
                                self.proxy.page.emit.apply(self.proxy.page, parsedEvent);
                        }
                    });
                };

            fs.open(filename, 'w+', function (err, fd) {
                fs.watchFile(filename, processEventFileChange);

                var spawn = require('child_process').spawn,
                    serverPath = __dirname + '/' + require('path').normalize('./server/webserver.js');

                var processArgs = translateOptions2Arguments(options);

                processArgs.unshift(JSON.stringify(options));
                processArgs.unshift(serverPath);

                //spawn new process
                phantomProcess =
                    spawn('phantomjs',
                        processArgs,
                        {
                            detatched:true,
                            stdio:
                                [
                                    'pipe',
                                    'pipe',
                                    'pipe'
                                ]
                        });

                phantomProcess.on('exit', function (code, signal) {
                    self.options.debug && console.log('phantom exited, unwatching event file');
                    fs.unwatchFile(filename, processEventFileChange);
                });

                phantomProcess.on('close', function () {
                    console.log('close called'.green);
                });

                phantomProcess.on('disconnect', function () {
                    console.log('disconnect called'.green);
                });
                phantomProcess.on('message', function () {
                    console.log('message called'.green);
                });

                processArray.push(phantomProcess);
            });

        },
    //use to see if  phantom server already runnings
        pingServer = function (options, callbackFn) {

            var self = this;
            request.get(options.hostAndPort + '/ping',
                function (error, response) {

                    if (response && response.statusCode === 200) {    //server up

                        callbackFn && callbackFn.call(self, true);
                    }
                    else {    //server down
                        callbackFn.call(self, false);
                    }
                });
            return this;
        };

    module.exports = {
        //terminates phantomjs process
        end:function (callbackFn) {
            var self = this;
            phantomProcess.on('exit', function () {
                console.log('phantom process exited'.green);
                callbackFn();
            });
            request.post(this.options.hostAndPort + '/phantom/functions/exit', {
                    form:{
                    }
                },
                function (error, response, body) {
                    self.options.debug && console.log('exit request sentt. response was : %s', body);
                });
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
            options.host = options.host || 'localhost';
            options.hostAndPort = 'http://' + options.host + ':' + options.port;

            options.debug && console.log('creating proxy to %s', options.hostAndPort);

            this.options = options;

            //try starting server
            createServer.call(self, options, function (proxy) {
                callbackFn.call(self, proxy);
            });

            return this;//return this to chain end
        }
    };
}(module, process));

