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

    var processArray =
            [
            ], //holds references to any spawned phantomjs procs
        phantomProcess, //current phantomjs process

    //creates a new phantomjs process
        createServer = function (options, callbackFn) {
            var Webpage = require('./webpage'),
                Phantom = require('./phantom'),
                fs = require('fs'),
                self = this,
                es = require('event-stream'),
                streamPosition = 0,

//            //pass proxy to callbackFn
//            callbackFn.call(self, self.proxy);

            //parses a line from phantoms event stream
                parseDataBuffer = function (dataBuffer) {
                    var self = this;

                    this.options.debug && console.log('buffer :%s', dataBuffer.grey);

                    try {
                        var parsedEvent = JSON.parse(dataBuffer);
                    }
                    catch (exception) {
                        console.log(exception.toString().red.bold);
                        console.log('attempted to parse %s', dataBuffer);
                        return;
                    }

                    var args = parsedEvent.args;
                    args.unshift(parsedEvent.type);

                    switch (parsedEvent.source) {
                        //phantomJs server module started and is listening or failed
                        case 'phantom' :
                            self.proxy.phantom.emit.apply(self.proxy.phantom, args);
                            break;
                        case 'page' :
                            self.proxy.page.emit.apply(self.proxy.page, args);
                            break;
                        case 'server' :
                            this.options.debug && console.log('emmiting %s event on %s'.grey, parsedEvent.type, parsedEvent.source);

                            console.log(JSON.stringify(args));
                            self.proxy.phantom.emit.apply(self.proxy.phantom, args);
                            break;
                        default :
                            throw new Error('unexpected eventsource:' + parsedEvent.source);

                    }

                };

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

            //create event stream
            fs.open(options.eventStreamPath, 'w+', function (err, fd) {
                self.options.debug && console.log('opening'.green, options.eventStreamPath);
                fs.watchFile(self.options.eventStreamPath, {interval:100}, onFileChanged);
                process.on('exit', function () {
                    fs.unwatchFile(self.options.eventStreamPath, onFileChanged);
                });
            });

            var createReadStream = function () {

                var streamReader = fs.createReadStream(options.eventStreamPath, {start:streamPosition });

                streamReader.on('end', function () {
                    streamReader.destroy();
                });

                return streamReader;
            };

            var onFileChanged = function (curr, prev) {
                if (curr.mtime > prev.mtime) {
                    es.pipeline(
                        createReadStream(),
                        es.split(),
                        es.map(function (line, cb) {
                            streamPosition += line.length + 1;
                            parseDataBuffer.call(self, line);

                            options.debug && console.log('parsed %d bytes so far', streamPosition);
                            cb(null, line)
                        })
                    );
                }
            };

            var spawnNewProcess = function () {
                var spawn = require('child_process').spawn,
                    serverPath = __dirname + '/' + require('path').normalize('./server/webserver.js');

                var processArgs = translateOptions2Arguments(options);

                processArgs.unshift(JSON.stringify(options));
                processArgs.unshift(serverPath);

                //spawn new process
                var phantomjs = spawn('phantomjs',
                    processArgs,
                    {
                        detatched:true,
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

