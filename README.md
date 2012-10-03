# phantom-proxy
Provides a proxy interface for phantomjs which runs inside of node.  Now you can run phantom and access the full api from within nodejs.

## Overview
PhantomJs is an incredibly useful tool for functional and unit testing.  Problem is that it runs in its own process which is outside of node, so you are basically out of luck if you want to integrate with phantomjs from within node.  There are some other libraries - phantom-node, node-phantom, that address the same problem.  


## Installation
`npm install phantom-proxy` 

## Usage
### API
#### phantomProxy object
##### CreateProxy(options, callbackFn)
use this method to create an instance of the phantom proxy objects.  The return value will be an object with a page proxy and a phantom proxy.  These properties correspond to the phantom and webpage objects on the native phantom API.  

When this method is called, a new phantomjs process is spawned.  The new phantomjs process creates a mongoose webserver on localhost:1061.  All subsequent communication with phantom occurs via http requests. 
```javascript
require('phantom-proxy').createProxy({}, function(proxy){
  var page = proxy.page,
  phantom = proxy.phantom;
  
});
```

#### Page Object
##### open(url, callbackFn)
Opens a webpage with url and callback function arguments.
```javascript
require('phantom-proxy').createProxy({}, function(proxy){
  var page = proxy.page,
  phantom = proxy.phantom;
  
  page.open('http://www.w3.org', function(){
    console.log('page now open');
  });  
  
});
```
##### waitForSelector(selector, callbackFn)
Polls page for presence of selector, executes callback when selector is present.
```javascript
require('phantom-proxy').createProxy({}, function(proxy){
  var page = proxy.page,
  phantom = proxy.phantom;
  
  page.open('http://www.w3.org', function(){
    page.waitForSelector('body', function(){
      console.log('body tag present');
    });
    console.log('page now open');
  });  
  
});
```

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

## FAQ
### Why do we need another nodejs runtime for phantom?
Phantom-proxy takes a different approach to communicating with phantom than these modules.  Phantom-node passes messages using alerts and express.  While this was an ingenious solution to a difficult problem at the time, better solutions are now available.  As of version 1.4, phantomjs provides an embedded webserver called mongoose which can be used to pass messages.  Phantom-proxy leverages this, which is the fastst and most reliable approach.



