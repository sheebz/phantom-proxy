var should = require("should"),
    assert = require('assert'),
    colors = require('colors'),
    phantomProxy = require('../index');

describe('phantomProxy', function () {

    it('should return an object with a phantom property', function (done) {
        this.timeout(10000);
        phantomProxy.create(function (proxy) {
            should.exist(proxy.page);
            should.exist(proxy.phantom);
            proxy.page.open('http://localhost:8002/#login/index', function (result) {
                console.log('result ' + result);
                assert.equal(result, true);
                done();
                phantomProxy.end();
            });
        });
    });

    it('should kill the phantomjs process', function () {
        phantomProxy.end();
        console.log(phantomProxy);
        assert.equal(phantomProxy.phantomProcess, undefined);
    });

});


