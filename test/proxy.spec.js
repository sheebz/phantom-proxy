var should = require("should"),
    assert = require('assert'),
    colors = require('colors'),
    phantomProxy = require('../index');

describe('phantomProxy', function () {
    describe('#create()', function () {
        it('should return a proxy object with phantom and webpage properties', function (done) {
            this.timeout(10000);
            phantomProxy.create(function (proxy) {
                should.exist(proxy.page);
                should.exist(proxy.phantom);
                phantomProxy.end();
                done();
            });
        });
        it('should create a proxy on a different port', function (done) {
            this.timeout(10000);
            var options = {
                "port":1062
            };
            phantomProxy.create(options, function (proxy) {
                should.exist(proxy.page);
                should.exist(proxy.phantom);
                phantomProxy.end();
                done();
            });
        });
    });
});


