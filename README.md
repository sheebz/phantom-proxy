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
var phantomProxy = require(phantom-proxy);

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

### API
#### phantomProxy object
##### create([options], callbackFn)
use this method to create an instance of the phantom proxy objects.  The return value will be an object with a page proxy and a phantom proxy.  These properties correspond to the phantom and webpage objects on the native phantom API.

When this method is called, a new phantomjs process is spawned.  The new phantomjs process creates a mongoose webserver on localhost:1061.  All subsequent communication with phantom occurs via http requests.

###### Options argument (experimental)
Create accepts an options object as the first parameter.  This argument is optional.  Properties and their default values are listed below.

```javascript

        var defaultoptions = {
            'ignoreSslErrors':true,
            'localToRemoteUrlAccessEnabled':true,
            'cookiesFile':'cookies.txt',
            'diskCache':'yes',
            'loadImages':'yes',
            'localToRemoteUrlAccess':'no',
            'maxDiskCache':'50000',
            'outputEncoding':'utf8',
            'proxy':'0',
            'proxyType':'yes',
            'scriptEncoding':'yes',
            'webSecurity':'yes',
            'port':1061
        };
```

##### end()
It is important to call end when you are done using the proxy to terminate the underlying phantomjs process that is being driven.

```javascript
var phantomProxy = require('phantom-proxy').create(function(proxy){
  var page = proxy.page,
  phantom = proxy.phantom;
  //do some stuff...
  //...
  //call end when done
  phantomProxy.end();
});
```

#### phantom Object
The phantom object corresponds to the phantom object in the native phantomJs API.

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
  });
```

##### open(url, callbackFn)
Opens a webpage with url and callback function arguments.

```javascript
var phantomProxy = require('phantom-proxy').create({}, function(proxy){
  var page = proxy.page,
  phantom = proxy.phantom;

  page.open('http://www.w3.org', function(){
    console.log('page now open');

    //close proxy
    phantomProxy.end();
  });

});
```

##### waitForSelector(selector, callbackFn, timeout)
Polls page for presence of selector, executes callback when selector is present.

```javascript
var phantomProxy = require('phantom-proxy').create({}, function(proxy){
  var page = proxy.page,
  phantom = proxy.phantom;

  page.open('http://www.w3.org', function(){
    page.waitForSelector('body', function(){
      console.log('body tag present');

        //close proxy
        phantomProxy.end();
    });
    console.log('page now open');
  });

});
```

##### render(fileName, callbackFn)
Renders a image of browser.

```javascript
var phantomProxy = require('phantom-proxy').create({}, function(proxy){
  var page = proxy.page,
  phantom = proxy.phantom;

  page.open('http://www.w3.org', function(){
    page.waitForSelector('body', function(){
      console.log('body tag present');
      page.render('myimage.png', function(){
        console.log('saved my picture!');

        //close proxy
        phantomProxy.end();
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
phantomProxy.create({}, function (proxy) {
    proxy.page.onConsoleMessage = function (event) {
        console.log(JSON.stringify(event));
    };
});
```

## More documentation and features to come...

## FAQ
### Why do we need another nodejs runtime for phantom?
The short answer is that phantom-proxy has a better implementation.  Other drivers seem to use a side effect of alerts to communicate with phantomjs, which unfortunately is not a good long term solution. Also all the other libraries I have seen do not have a fully implemented the evaluate function - you can't pass additional arguments to the client side function.  This is a big problem and was the main motivation for creating this package.

## Revision History
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

