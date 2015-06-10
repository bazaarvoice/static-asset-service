# Static Asset Loader SDK

This directory provides an SDK that client-side web applications can use to request and receive the static resources they require.

## Basic usage

### Requiring resources

If your application requires a resource that is supported by the SDK, you can use the SDK to request that resource via the SDK's `require` method.

Your application is responsible for providing a script loader that the SDK can use; the scriptLoader should be a function that takes a script URL and a node-style callback as its arguments.

```js
// You must provide a script loader to the SDK; chances are good
// that your application already has one, but if not, you can use
// the next five lines.
function getScript (url) {
  var s = document.createElement('script');
  s.src = url;
  document.body.appendChild(s);
}

// Load the SDK and provide it with a script loader.
var staticAssets = require('static-assets/sdk')({
  loader : getScript,

  // You must set a namespace for the SDK; the SDK will need to
  // create $NAMESPACE._staticAssetRegistry, and will add
  // properties and methods there.
  namespace : window.BV,

  // You must set a base URL for the SDK; it will request files
  // using this URL. Files hosted at this URL will be expected to
  // define individual resources by wrapping them in a function that
  // corresponds with the namespace set above:
  //
  // (function (define) {
  //   define('jquery-bv@1.1.1', function () {
  //     // ...
  //     return jQuery;
  //   });
  //  
  //   define('backbone@1.2.0', [
  //     'jquery-bv@1.11.1',
  //     'lodash-bv@1.2.0'
  //   ], function ($, _) {
  //     // ...
  //     return Backbone;
  //   });
  // }($NAMESPACE._staticAssetRegistry.define));
  baseUrl : 'https://display.ugc.bazaarvoice.com/common/static-assets/1/'
});

// Indicate the assets you require.
staticAssets.require([
  'underscore@1.0.0',
  'jquery-bv@1.11.1',
  'backbone@1.2.0'
], function (_, $, Backbone) {
  // This function will be called when all of the
  // required assets have been resolved.
});
```

**Note:** If you request an asset that has dependencies -- for example, Backbone has a dependency on jQuery and Underscore/Lodash -- you *must* either request those dependencies in the same `require` call, or `define` them (see below) prior to your `require` call.

### Providing resources

Applications that ship with resources that might be useful to other applications on the page can provide those resources via the SDK:

```js
var staticAssets = require('static-assets/sdk')({
  // see above for required options
});

staticAssets.define('jquery-bv@1.11.1', jQuery);
```

## Usage within BV

Follow the usage instructions above; you should always set a namespace of `window.BV`, and set a base URL based on the environment in which you are running:

| Environment | Base URL |
|-------------|------|
| QA | https://display-qa.ugc.bazaarvoice.com/common/static-assets/1/ |
| STG | https://display.ugc.bazaarvoice.com/common/static-assets/1/ |
| PROD | https://display.ugc.bazaarvoice.com/common/static-assets/1/ |

This repo includes the following resources, which covers Curations and Firebird use cases:

| Asset Name | Dependencies | Description |
| ---- | ---- | ---- |
| jquery-bv@1.11.1 | | jQuery 1.11.1 with BV modifications. |
| lodash-bv@1.2.0 | | Firebird Lodash. |
| underscore-bv@1.5.2 | | Curations Underscore. |
