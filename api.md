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
sets property on page object

```javascript
  //set viewport size for browser window
  proxy.page.set('viewportSize',
  { width:320, height:480 }, function (result) {
      console.log(result.toString().cyan);
      worldCallback.call(self);
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
<tr><td>confirm</td><td>Event will fire, but callback will not execute in phantomjs context</td></tr>
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

