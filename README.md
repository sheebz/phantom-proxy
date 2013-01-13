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
See the [API](https://github.com/sheebz/phantom-proxy/blob/master/api.md) documentation for more usage information.

#### wait for a specific selector to appear
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

#### render a screenshot
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

#### subscribe to events - see api docs for complete list
```javascript
phantomProxy.create({"debug":true}, function (proxy) {
    self.proxy.page.on('navigationRequested', function (url) {
      console.log('at %s', url);

      if (url === 'http://www.w3.org') {
        console.log('at w3.org');
      }
      else {
        console.log('how did we get here?');
      }

      proxy.end(function () {
        console.log('done');
      });
    });

    proxy.page.open('http://www.w3.org', function (result) {
      proxy.page.on('alert', function (msg) {
          if (msg.trim() === 'hello') {
              console.log('it said hello');
          }

        proxy.end(function () {
          console.log('done');
        });
      });



    });
});

```
# API Documentation
## phantomProxy object
### create([options], callbackFn)
use this method to create an instance of the phantom proxy objects.  The return value will be an object with a page proxy and a phantom proxy.  These properties correspond to the phantom and webpage objects on the native phantom API.

When this method is called, a new phantomjs process is spawned.  The new phantomjs process creates a mongoose webserver on localhost:1061.  All subsequent communication with phantom occurs via http requests.

#### Options argument (experimental)
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

### end(callbackFn)
You should call end on the returned proxy object to ensure that phantomjs is properly shut down.

```javascript
var phantomProxy = require('phantom-proxy').create(function(proxy){
  var page = proxy.page,
  phantom = proxy.phantom;
  //do some stuff...
  //...
  //call end when done
  proxy.end(function(){
    console.log('phantom has exited');
  });
});
```

## phantom Object
The phantom object corresponds to the phantom object in the native phantomJs API.

## Page Object
The page object corresponds to the webpage object in the native phantomJs API.

### set(propertyName, propertyValue, callbackFn)
sets setting on page object

```javascript
  proxy.page.set('userAgent', 'iPad', function (result) {
      console.log(result.toString());
  });
```

### get(propertyName, callbackFn)
gets a setting on page object

```javascript
  proxy.page.get('userAgent', function (result) {
      console.log(result.toString());
  });
```

### open(url, callbackFn)
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

### waitForSelector(selector, callbackFn, timeout)
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

### render(fileName, callbackFn)
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

### renderBase64(type, callbackFn)
Returns a base64 representation of image.

### evaluate(functionToEvaluate, callbackFn, [arg1, arg2,... argN]
Executes functionToEvaluate in phantomJS browser.  Once function executes, callbackFn will be invoked with a result parameter. The Third and sebsequent arguments represent optional parameters which will be passed to the functionToEvaluate function when it is invoked in the browser.

## Events
The following events are supported, see [PhantomJs Docs](https://github.com/ariya/phantomjs/wiki/API-Reference) for more information.

<table><thead><th>Event Name</th><th>Notes</th></thead>
<tbody>
<tr><td>urlChanged</td><td></td></tr>
<tr><td>resourceReceived</td><td></td></tr>
<tr><td>resourceRequested</td><td></td></tr>
<tr><td>prompt</td><td>Event will fire, but callback will not execute in phantomjs context</td></tr>
<tr><td>pageCreated</td><td></td></tr>
<tr><td>navigationRequested</td><td></td></tr>
<tr><td>loadStarted</td><td></td></tr>
<tr><td>loadFinished</td><td></td></tr>
<tr><td>initialized</td><td></td></tr>
<tr><td>error</td><td></td></tr>
<tr><td>consoleMessage</td><td></td></tr>
<tr><td>confirm</td><td>See onConfirmCallback for handling this event</td></tr>
<tr><td>closing</td><td></td></tr>
<tr><td>callback</td><td></td></tr>
<tr><td>alert</td><td></td></tr>
</tbody>
</table>


#### Subscribing to events

```javascript
phantomProxy = require('phantom-proxy');
phantomProxy.create({}, function (proxy) {
    proxy.page.on('urlChanged', function(){
      console.log('url changed');
    });
});
```

#### Special events

Some phantomjs functions allow you to return a value to drive phantom interaction. Currently, onConfirm is supported. To register a callback function for intercepting confirm dialogs, use onConfirmCallback:

```javascript
// return true corresponds to accepting confirm, return false is denying
proxy.page.set('onConfirmCallback', function(msg) { return true; });
```

Pre-registering a confirm function can be useful if you encounter a page that prompts you when you try to leave. Without registering a function that returns true, phantomjs will hang. Please note you can still listen for the 'confirm' event in conjunction with this special handler.

## Revision History
* 2012-11-06 - version 0.1.6
 - reworked event communication interface to use socket.io - no longer using filesyste to pass event messages, should help with dropped msgs
* 2012-11-06 - version 0.1.6
 - reworked event communication interface - no longer using stdoutput to pass event messages
 - reworked process creation and exit logic
 - startup time and event latency are much improved - should run much faster than before
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

