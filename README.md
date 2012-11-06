# phantom-proxy
* Allows you to drive [phantomjs](www.phantomjs.org) from [node](www.nodejs.org)
* Does not rely on alert side effects for communicating with phantomjs
* Uses Phantom's embedded mongoose web server for communication - more efficient, simpler, faster.
* Provides a full api - including a parametrized evaluate function - no more hard coded strings
* Provides additional useful methods such as waitForSelector
* Can easily integrate with feature testing frameworks such as [cucumber](https://github.com/cucumber/cucumber-js), jasmine, mocha

## Overview
PhantomJs is an incredibly useful tool for functional and unit testing.  PhantomJs runs in its own process, making it difficult to drive from node.  Phantom-proxy solves this problem, allowing you to fully drive phantomjs from node.

## Installation

`npm install phantom-proxy`

## Usage
### Examples
Navigate to web page and check for body page
```javascript
var phantomProxy = require('phantom-proxy');

phantomProxy.create({}, function (proxy) {
    var page = proxy.page;
    page.open('http://www.w3.org', function () {
        page.waitForSelector('body', function () {
            console.log('body tag present');
            proxy.end();
        });
    });

});
```

Same example but, checking for a body tag and rendering a snapshot.
```javascript
            phantomProxy.create({"debug":true}, function (proxy) {
                proxy.page.open('http://www.w3.org', function (result) {
                    assert.equal(result, true);
                    proxy.page.waitForSelector('body', function (result) {
                        assert.equal(result, true);
                        proxy.page.render('./scratch/scratch.png', function (result) {
                            assert.equal(result, true);
                            proxy.end(function () {
                              console.log('done');
                            });
                        });
                    }, 1000);
                });
            });
            ```


See the [API](https://github.com/sheebz/phantom-proxy/blob/master/api.md) documentation for more usage information.

## Revision History
* 2012-11-06 - version 0.1.5
 - reworked event communication interface - no longer using stdoutput to pass event messages
 - reworked process creation and exit logic
* 2012-11-03 - version 0.1.3
  - added callback parameter to end method on proxy.
  - removed unref call in proxy
  - added debug option
* 2012-10-22 - version 0.1.2
  - breaking - changed the way events are consumed, switched to using nodes emmitter to brodcast events as opposed to invoking instance methods on the object.  To fix issues, use [object].on('eventname') style syntax.
  - Code clean up
* 2012-10-17 - version 0.1.16
   - fixed waitforSelector issue
* 2012-10-12  - version 0.1.15
    - fixed a problem w/ waitforSelector fn.
    - fixed problem where process wasn't shutting down existing server.
* version 0.1.13
  - added args property handling for phantom object
  - added ability to specify port for rpc channel
  - added timeout on waitforSelector function
  - added ability to pass cmd line arguments for phantom via options object
* version 0.1.10
  - cleaned up and reorganized code
  - added unit tests
  - fixed process related issues

