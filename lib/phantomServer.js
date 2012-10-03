(function () {
    var serverHelper = {
        initialize:function () {
            //create wrapper for page interface
            this.pageWrapper = require('./pageWrapper').create();
            //create wrapper for phantom interface
            this.phantomWrapper = require('./phantomWrapper').create();

            //server instance
            this.server = require('webserver').create();

            var result = this.server.listen(1061, function (request, response) {

                try {
                    serverHelper.processRequest(request, response);
                }
                catch (error) {
                    console.error(error);
                    phantom.exit();
                }
            });

            if (result === true) {
                console.log(0);
            }
            else {
                console.log(1);
            }
        },
        extractFunctionExpressions:function (request, response, array) {
            var expressionFn;
            eval('expressionFn = request.post.expressionFn;');
            array.push(expressionFn);
        },
        extractArguments:function (request, response, array) {
            var arguments = JSON.parse(request.post.arguments);
            if (typeof arguments === 'string') {
                array.push(request.post['arguments']);
            }
            else if (arguments.length) {
                for (prop in arguments) {
                    array.push(arguments[prop]);
                }
            }
            else {
                array.push(arguments[prop]);
            }
        },
        processRequest:function (request, response) {

            var args =
                [
                ];

            if(request.post){
                request.post.expressionFn && this.extractFunctionExpressions(request, response, args);
                request.post.arguments && this.extractArguments(request, response, args);
            }
            else{
                var parser = document.createElement('a'),
                    resource = undefined;

                //parse object and method names
                parser.href = request.url;
                searchParts = parser.pathname.split('/');

                //parse rest parts
                resourceName = searchParts[1];
                collection = searchParts[2];
                controller = searchParts[3];

                if(resourceName === 'ping'){
                    response.statusCode = 200;
                    response.write('ok');
                    response.close();
                    return;
                }
            }

            this.executeAction(args, request, response);

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
        executeAction:function (args, request, response) {
            var parser = document.createElement('a'),
                resource = undefined;

            //parse object and method names
            parser.href = request.url;
            searchParts = parser.pathname.split('/');

            //parse rest parts
            resourceName = searchParts[1];
            collection = searchParts[2];
            controller = searchParts[3];

            //get resource and set response
            resource = this.getResource(resourceName);
            resource.setResponse(response);

            switch (collection) {
                case 'functions' :
                    resource[controller].apply(resource, args);
                    break;
                case 'properties' :
                    switch (controller) {
                        case 'get':
                            resource.getProperty(request.post.propertyName);
                            break;
                        case 'set':
                            console.log('prop' +  request.post.propertyValue);
                            resource.setProperty(request.post.propertyName, request.post.propertyValue);
                            break;
                    }
                    break;
            }
        }
    };
    serverHelper.initialize();
}());
