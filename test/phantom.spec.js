var should = require("should"),
    assert = require('assert'),
    colors = require('colors'),
    phantomProxy = require('../index');

describe('webpage', function () {

    require('./phantom/injectJs.js');

    before(function (done) {
        this.timeout(10000);
        phantomProxy.create(function (value) {
            proxy = value;
            done();
        });

    });
    after(function () {
        phantomProxy.end();
    });
});
