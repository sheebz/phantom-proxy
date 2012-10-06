# phantom-proxy
Provides a proxy interface for phantomjs which runs inside of node.  Now you can run phantom and access the full api from within nodejs.

## Overview
PhantomJs is an incredibly useful tool for functional and unit testing.  Problem is that it runs in its own process which is outside of node, so you are basically out of luck if you want to integrate with phantomjs from within node.  There are some other libraries - phantom-node, node-phantom, that address the same problem.  


## Installation
`npm install phantom-proxy` 

## Usage
### API
#### phantomProxy object
##### create(options, callbackFn)
use this method to create an instance of the phantom proxy objects.  The return value will be an object with a page proxy and a phantom proxy.  These properties correspond to the phantom and webpage objects on the native phantom API.  

When this method is called, a new phantomjs process is spawned.  The new phantomjs process creates a mongoose webserver on localhost:1061.  All subsequent communication with phantom occurs via http requests. 
```javascript
require('phantom-proxy').createProxy({}, function(proxy){
  var page = proxy.page,
  phantom = proxy.phantom;
  
});
```

#### phantom Object
The phantom object corresponds to the phantom object in the native phantomJs API.
#### exit(callbackFn)
Terminates phantom webserver and destroys proxy.
```javascript
require('phantom-proxy').createProxy({}, function(proxy){
  var page = proxy.page,
  phantom = proxy.phantom;
  
  page.open('http://www.w3.org', function(){
    console.log('page now open');
    phantom.exit(function(){
      console.log('phantom proxy is now offline');
    });
  }); 
});
```

#### Page Object
The page object corresponds to the webpage object in the native phantomJs API.

##### set(propertyName, propertyValue, callbackFn)
sets property on page object
```javascript
                //set viewport size for browser window
                proxy.page.set('viewportSize', 
                { width:320, height:480 }, function (result) {
                    console.log(result.toString().cyan);
                    worldCallback.call(self);
                })
```
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

##### render(fileName, callbackFn)
Renders a image of browser.
```javascript
require('phantom-proxy').createProxy({}, function(proxy){
  var page = proxy.page,
  phantom = proxy.phantom;
  
  page.open('http://www.w3.org', function(){
    page.waitForSelector('body', function(){
      console.log('body tag present');
      page.render('myimage.png', function(){
        console.log('saved my picture!');
      });
    });
    console.log('page now open');
  });  
  
});
```
##### renderBase64(type, callbackFn)
Returns a base64 representation of image. 

##### evaluate(functionToEvaluate, callbackFn, [arg1, arg2,... argN]
Executes functionToEvaluate in phantomJS browser.  Once function executes, callbackFn will be invoked with a result parameter. The Third and sebsequent arguments represent optional parameters which will be passed to the functionToEvaluate function when it is invoked in the browser.

#### Events
#### Subscribing to events
```javascript
phantomProxy = require('phantom-proxy');
phantomProxy.createProxy({}, function (proxy) {
    proxy.page.onConsoleMessage = function (event) {
        console.log(JSON.stringify(event));
    };
});
```

## FAQ
### Why do we need another nodejs runtime for phantom?
Phantom-proxy takes a different approach to communicating with phantom than these modules.  Phantom-node passes messages using alerts and express.  While this was an ingenious solution to a difficult problem at the time, better solutions are now available.  As of version 1.4, phantomjs provides an embedded webserver called mongoose which can be used to pass messages.  Phantom-proxy leverages this, which is the fastst and most reliable approach.



