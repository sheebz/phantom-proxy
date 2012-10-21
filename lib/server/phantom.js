/*global   require:false, phantom:false, module:false*/
(function (module, phantom) {
    'use strict';
    module.exports = {
        create:function () {
            return this;
        },
        setResponse:function (response) {
            this.response = response;
        },
        exitHard : function(){
            phantom.exit();
        },
        exit:function () {
            this.response.statusCode = 200;
            this.response.write('done');
            this.response.close();
            phantom.exit();
        },
        setProperty:function (propertyName, propertyValue) {
            var valueToSet;
            try {
                try {
                    valueToSet = JSON.parse(propertyValue);
                } catch (error) {
                    valueToSet = propertyValue;
                }
                phantom[propertyName] = valueToSet;
                this.response.write(JSON.stringify(phantom[propertyName]));
                this.response.statusCode = 200;
                this.response.close();

            } catch (ex) {
                this.response.statusCode = 500;
                this.response.write(ex);
                this.response.close();
            }
        },
        getProperty:function (propertyName) {
            try {
                var result;

                if (propertyName === 'args') {
                    result = JSON.stringify(require('system').args);
                }
                else{
                    result = JSON.stringify(phantom[propertyName], null, 4);
                }

                this.response.statusCode = 200;
                this.response.write(result);
                this.response.close();
            } catch (ex) {
                this.response.statusCode = 500;
                this.response.write(ex);
                this.response.close();
            }
        }
    };
}(module, phantom));
