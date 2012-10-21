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
```javascript
var phantomProxy = require('phantom-proxy');

phantomProxy.create({}, function (proxy) {
    var page = proxy.page;
    page.open('http://www.w3.org', function () {
        page.waitForSelector('body', function () {
            console.log('body tag present');
            phantomProxy.end();
        });
    });

});
```

See the [API](https://github.com/sheebz/phantom-proxy/blob/master/api.md) documentation for more usage information.

## FAQ
### Why do we need another nodejs runtime for phantom?
The short answer is that phantom-proxy has a better implementation.  Other drivers seem to use a side effect of alerts to communicate with phantomjs, which unfortunately is not a good long term solution. Also all the other libraries I have seen do not have a fully implemented the evaluate function - you can't pass additional arguments to the client side function.  This is a big problem and was the main motivation for creating this package.

## Revision History
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

