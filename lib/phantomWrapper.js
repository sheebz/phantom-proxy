module.exports = {
    create:function () {
        return this;
    },
    setResponse:function (response) {
        this.response = response;
    },
    exit:function () {
        this.response.statusCode = 200;
        this.response.write('done');
        this.response.close();
        phantom.exit();
    },
    setProperty:function (propertyName, propertyValue) {
        phantom[propertyName] = JSON.parse(propertyValue);
        this.response.write('');
        this.response.statusCode = 200;
        this.response.close();
    },
    getProperty:function (propertyName) {
        var result = JSON.stringify(phantom[propertyName], null, 4);

        this.response.statusCode = 200;
        this.response.write(result);
        this.response.close();
    }
};
