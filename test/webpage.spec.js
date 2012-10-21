var should = require("should"),
    assert = require('assert'),
    colors = require('colors'),
    phantomProxy = require('../index');

describe('webpage', function () {

    require('./webpage/open.js');
    require('./webpage/evaluate.js');
    require('./webpage/render.js');
    require('./webpage/set.js');
    require('./webpage/waitForSelector.js');

    before(function (done) {
        this.timeout(10000);
        phantomProxy.create(function (value) {
            proxy = value;
            proxy.page.on('resourceRequested', function (request) {
                console.log(JSON.stringify(event));
            });

            proxy.page.open('http://www.w3.org', function (result) {
                assert.equal(result, true);
                done();
            });
        });

    });
    after(function () {
        phantomProxy.end();
    });
});
