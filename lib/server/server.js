/*global  phantom:false, document:false, console:false, require:false*/
(function (module) {
    'use strict';

    module.exports = {
        initialize:function () {
            var self = this;
            this.options = JSON.parse(require('system').args[1]);

            var webpage = require('webpage');
            var controlpage = webpage.create();

            this.emit = function (source, event) {
                event.source = source;
                controlpage.evaluateAsync('function(){socket.emit("res",' + JSON.stringify(event) + ');}');
            };

            //create wrapper for page interface
            this.pageWrapper = require('./webpage').create(this);
            //create wrapper for phantom interface
            this.phantomWrapper = require('./phantom').create(this);

            this.options.debug && console.log('opening control page');

            controlpage.open('http://127.0.0.1:' + this.options.clientPort + '/', function (status) {
                self.options.debug && console.log(status);

                //server instance
                self.server = require('webserver').create();
                var service = self.server.listen(self.options.port, function (request, response) {

                    try {
                        self.processRequest(request, response);
                    }
                    catch (error) {
                        console.error(error);
                    }
                });

                self.emit('server', {
                    "type":'serverCreated',
                    "args":
                        [
                            service
                        ]
                });
            });

        },
        /*jshint  evil:true*/
        extractFunctionExpressions:function (request, response, array) {
            var expressionFn;
            eval('expressionFn = request.post.expressionFn;');
            array.push(expressionFn);
        },
        extractArguments:function (request, response, array) {
            var args = JSON.parse(request.post.args),
                prop;

            if (typeof args === 'string') {
                array.push(request.post.args);
            }
            else if (args.length) {
                for (prop in args) {
                    array.push(args[prop]);
                }
            }
            else {
                array.push(args);
            }
        },
        parseUrlSegments:function (url) {
            var parser = document.createElement('a'),
                searchParts;

            //parse object and method names
            parser.href = url;
            searchParts = parser.pathname.split('/');

            return {
                resourceName:searchParts[1],
                collection:searchParts[2],
                controller:searchParts[3]
            };
        },
        processRequest:function (request, response) {

            var args =
                    [
                    ],
                segments = this.parseUrlSegments(request.url);

            if (request.post) {
                request.post.expressionFn && (this.extractFunctionExpressions(request, response, args));
                request.post.args && (this.extractArguments(request, response, args));
            }
            else {

                if (segments.resourceName === 'ping') {
                    response.statusCode = 200;
                    response.write('ok');
                    response.close();
                    return;
                }
            }

            this.executeAction(segments, args, request, response);
        },
        getResource:function (resourceName) {
            var resource;
            switch (resourceName) {
                case 'phantom' :
                    resource = this.phantomWrapper;
                    break;
                case 'page' :
                    resource = this.pageWrapper;
                    break;
                default :
                    throw new Error('unhandled resource:' + resourceName);
            }
            return resource;
        },
        executeAction:function (segments, args, request, response) {

            //get resource and set response
            var resource = this.getResource(segments.resourceName);
            resource.setResponse(response);

            switch (segments.collection) {
                case 'functions' :
                    resource[segments.controller].apply(resource, args);
                    break;
                case 'properties' :
                    switch (segments.controller) {
                        case 'get':
                            resource.getProperty(request.post.propertyName);
                            break;
                        case 'set':
                            resource.setProperty(request.post.propertyName, request.post.propertyValue);
                            break;
                    }
                    break;
                case 'settings' :
                    switch (segments.controller) {
                        case 'get':
                            resource.getSetting(request.post.propertyName);
                            break;
                        case 'set':
                            resource.setSetting(request.post.propertyName, request.post.propertyValue);
                            break;
                    }
                    break;
            }
        }
    };

}(module));
