(function (module, process) {
    'use strict';
    var colors = require('colors'),
        request = require('./request/main'),
        _ = require('underscore'),
        Q = require('q'),
        events = require('events');

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
        var phantomArgMap = {
            'cookiesFile':'cookies-file',
            'config': 'config',
            'debug': 'debug',
            'diskCache':'disk-cache',
            'ignoreSslErrors':'ignore-ssl-errors',
            'loadImages':'load-images',
            'localToRemoteUrlAccessEnabled':'local-to-remote-url-access',
            'maxDiskCache':'max-disk-cache-size',
            'outputEncoding':'output-encoding',
            'proxy':'proxy',
            'proxyType':'proxy-type',
            'scriptEncoding':'script-encoding',
            'version':'version',
            'webSecurity':'web-security'
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
            'webSecurity':'no'
        };

        //map options props to cmd line args for phantom process

        var phantomArgs = []
            , proxyArgs = [];

        for (var k in options) {
            if (options.hasOwnProperty(k)) {
                if (phantomArgMap[k]) {
                    phantomArgs.push('--' + phantomArgMap[k] + '=' + options[k]);
                } else {
                    var uncamel = k.replace(/[A-Z]/g, function(c) {
                        return '-' + c.toLowerCase();
                    });
                    proxyArgs.push('--' + uncamel + '=' + options[k]);
                }
            }
        }

        return {
            phantom: phantomArgs,
            proxy: proxyArgs
        };
    };

//    //on exit loop through process array and kill everything
//    process.on('exit', function () {
//        processArray.forEach(function (proc) {
//            proc.kill('SIGHUP');
//        });
//    });

    //creates a new phantomjs process
    var createServer = function (options, callbackFn) {
            var Webpage = require('./webpage'),
                Phantom = require('./phantom'),
                self = this,
                streamPosition = 0,

//            //pass proxy to callbackFn
//            callbackFn.call(self, self.proxy);

            //parses a line from phantoms event stream
                parseResponse = function (response) {
                    var parsedEvent;

                    self.options.debug && console.log('buffer :%s'.grey, response);

                    try {
                        parsedEvent = JSON.parse(response);
                    }
                    catch (exception) {
                        console.error(exception.toString().red.bold);
                        console.error('attempted to parse %s', response);
                        return;
                    }

                    var args = parsedEvent.args;
                    args.unshift(parsedEvent.type);

                    self.options.debug && console.log('emitting %s event on %s'.grey, parsedEvent.type, parsedEvent.source);

                    switch (parsedEvent.source) {
                        //phantomJs server module started and is listening or failed
                        case 'phantom' :
                            self.proxy.phantom.emit.apply(self.proxy.phantom, args);
                            break;
                        case 'page' :
                            self.proxy.page.emit.apply(self.proxy.page, args);
                            break;
                        case 'server' :
                            self.proxy.phantom.emit.apply(self.proxy.phantom, args);
                            break;
                        default :
                            throw new Error('unexpected eventsource:' + parsedEvent.source);

                    }

                };

            var spawnNewProcess = function () {
                var spawn = require('child_process').spawn,
                    serverPath = __dirname + '/' + require('path').normalize('./server/index.js');

                var args = translateOptions2Arguments(options);
                args.proxy.unshift(serverPath, JSON.stringify(options));
                var processArgs = args.phantom.concat(args.proxy);

                //spawn new process
                var phantomjs = spawn('phantomjs',
                    processArgs,
                    {
                        detatched:false,
                        stdio:
                            [
                                process.stdin,
                                process.stdout,
                                process.stderr
                            ]
                    });

                //  phantomjs.unref && phantomjs.unref();
            };

            var ensureServerRunning = function () {
                pingServer(options, function (result) {
                    self.options.debug && console.log('pinged server and got back %s', result);

                    if (result) {
                        self.options.debug && console.log('server already running... proxy value %s', JSON.stringify(self.proxy));
                        callbackFn(self.proxy);

                    }
                    else {
                        self.options.debug && console.log('creating a new server, waiting for servercreated event on %s', self.proxy.phantom);

                        self.proxy.phantom.on('serverCreated', function (result) {
                            self.options.debug && console.log('server created callback fired with value:%s'.yellow.bold, result);
                            callbackFn(self.proxy);
                        });

                        spawnNewProcess();
                    }
                });
            };

            //socket io implementation - credit to node-phantom
            var socketio = require('socket.io');
            var http = require('http');
            this.server = http.createServer(function (request, response) {
                response.writeHead(200, {"Content-Type":"text/html"});
                response.end('<html><head><script src="/socket.io/socket.io.js" type="text/javascript"></script><script type="text/javascript">\n\
                    window.onload=function(){\n\
                    var socket = new io.connect("http://" + window.location.hostname);\n\
                    window.socket = socket;\n\
                    };\n\
                    </script></head><body></body></html>');
            }).listen();

            options.clientPort = this.server.address().port;
            var io = socketio.listen(this.server, {'log level':1});

            io.sockets.on('connection', function (socket) {
                options.debug && console.log('connection'.green);
                socket.on('res', function (response) {
                    var data = JSON.stringify(response);
                    options.debug && console.log('response: %s'.green, data);
                    parseResponse(data);
                });
            });

            //create proxy object
            self.proxy = {
                page:new Webpage(options),
                phantom:new Phantom(options),
                end:function (endCallback) {
                    self.end(function () {
                        endCallback(true);
                    });
                }
            };

            ensureServerRunning();
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
            request.post(this.options.hostAndPort + '/phantom/functions/exit', {
                    form:{
                    }
                },
                function (error, response, body) {

                    if (response && response.statusCode === 200) {    //server up
                        self.server.close();
                        callbackFn && callbackFn.call(self, true);
                    }
                    else {    //server down
                        callbackFn.call(self, false);
                    }
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
            options.eventStreamPath = require('path').normalize(__dirname + '/../temp/events.txt');

            options.debug && console.log('creating proxy to %s', options.hostAndPort);

            this.options = options;

            //try starting server
            createServer.call(self, options, function (proxy) {
                callbackFn.call(self, proxy);
            });

            return this;//return this to chain end
        }};
}
    (module, process)
    )
;

