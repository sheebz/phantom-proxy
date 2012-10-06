(function (module) {
    'use strict';
    var request = require('./request/main');
    module.exports = {
        //creates instance of proxy
        create:function (phantomProcess) {
            this.phantomProcess = phantomProcess;

            return this;
        },
        //properties
        //sets property
        set:function (propertyName, propertyValue, callbackFn) {
            var self = this;
            request.post('http://localhost:1061/phantom/properties/set', {
                    form:{
                        propertyName:propertyName,
                        propertyValue:JSON.stringify(propertyValue, null, 4)
                    }
                },
                function (error, response, body) {
                    if (response.statusCode === 200) {
                        callbackFn && callbackFn.call(self, body);
                    }
                    else {
                        console.error(body);
                        throw new Error(body);
                    }
                });
        },
        //gets property value ex. version
        get:function (propertyName, callbackFn) {
            var self = this;
            request.post('http://localhost:1061/phantom/properties/get', {form:{ propertyName:propertyName}},
                function (error, response, body) {
                    if (response.statusCode === 200) {
                        callbackFn && callbackFn.call(self, body);
                    }
                    else {
                        console.error(body);
                        throw new Error(body);
                    }
                });
        },
        //functions
        //kills phantomJs process
        exit:function (callbackFn) {
            phantomProcess.kill('SIGHUP');
            callbackFn();
        },
        //Injects external script code from the specified file. If the file can not be found in the current directory, libraryPath is used for additional look up.
        //  This function returns true if injection is successful, otherwise it returns false.
        injectJs:function (filename, callbackFn) {
            var self = this;
            request.post('http://localhost:1061/phantom/functions/injectJs', {form:{arguments:JSON.stringify(arguments)}},
                function (error, response, body) {
                    if (response.statusCode === 200) {
                        callbackFn && callbackFn.call(self, body);
                    }
                    else {
                        console.error(body);
                        throw new Error(body);
                    }
                });
        }
    };
}(module));
