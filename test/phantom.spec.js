var should = require("should"),
    assert = require('assert'),
    colors = require('colors'),
    phantomProxy = require('../index');

describe('phantom', function () {
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
    require('./phantom/injectJs.js');
    require('./phantom/args.js');

});
