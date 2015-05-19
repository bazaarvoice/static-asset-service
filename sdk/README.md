# Static Asset Loader SDK

This directory provides an SDK that client-side web applications can use to request and receive the static resources they require.

## Basic usage

### Requiring resources

If your application requires a resource that is supported by the SDK, you can use the SDK to request that resource via the SDK's `require` method.

Your application is responsible for providing a script loader that the SDK can use; the scriptLoader should be a function that takes a script URL and a node-style callback as its arguments.

```js
// Load the SDK and provide it with a script loader.
var staticAssets = require('static-assets/sdk')(scriptLoader);

// You must set a namespace for the SDK; the SDK will need to
// create window[NAMESPACE]._staticAssetRegistry, and will add
// properties and methods there.
staticAssets.setNamespace('BV');

// You must set a base URL for the SDK; it will request files
// using this URL. Files hosted at this URL will be expected to
// define individual resources by wrapping them in a function that
// corresponds with the namespace set above:
//
// BV._staticAssetRegistry.define(
//  'jquery-bv@1.1.1', {
//    // ...
//  });
staticAssets.setBaseURL('https://display.ugc.bazaarvoice.com/common/static-assets/');

// Indicate the assets you require.
staticAssets.require([
  'jquery-bv@1.11.1',
  'backbone@1.2.0'
], function ($, Backbone) {
  // This function will be called when all of the
  // required assets have been resolved.
})
```

### Providing resources

Applications that ship with resources that might be useful to other applications on the page can provide those resources via the SDK:

```js
var staticAssets = require('static-assets/sdk')(scriptLoader);
staticAssets.setNamespace('BV');
staticAssets.provide('jquery-bv@1.11.1', jQuery);
```

## Usage within BV

Follow the usage instructions above; you should always set a namespace of `'BV'`, and set a base URL based on the environment in which you are running:

| Environment | Base URL |
|-------------|------|
| QA | https://display-qa.ugc.bazaarvoice.com/common/static-assets/ |
| STG | https://display.ugc.bazaarvoice.com/common/static-assets/ |
| PROD | https://display.ugc.bazaarvoice.com/common/static-assets/ |
