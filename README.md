# phantom-proxy
Provides a proxy interface for phantomjs which runs inside of node.  Now you can run phantom and access the full api from within nodejs.

## Overview
PhantomJs is an incredibly useful tool for functional and unit testing.  Problem is that it runs in its own process which is outside of node, so you are basically out of luck if you want to integrate with phantomjs from within node.  There are some other libraries - phantom-node, node-phantom, that address the same problem.  

## Why do we need another nodejs runtime for phantom?
Phantom-proxy takes a different approach to communicating with phantom than these modules.  Phantom-node passes messages using alerts and express.  While this was an ingenious solution to a difficult problem at the time, better solutions are now available.  As of version 1.4, phantomjs provides an embedded webserver called mongoose which can be used to pass messages.  Phantom-proxy leverages this, which is the fastst and most reliable approach.

##Instalation
`npm install phantom-proxy` 

##usage

```javascript
phantomProxy = require('phantom-proxy');
phantomProxy.createProxy({}, function (proxy) {
    proxy.page.onConsoleMessage = function (event) {
        console.log(JSON.stringify(event));
    };
    proxy.page.open('http://www.google.com', function () {
        proxy.page.waitForSelector('body', function () {
            proxy.page.render('./scratch/loginTest.png', function () {
                proxy.phantom.exit(function () {
                    console.log('test complete');
                });
            });
        });
    });
});
```

