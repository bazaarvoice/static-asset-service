# Generator

This directory provides tools for creating and deploying static resources so they can be consumed by the [SDK](../sdk/README.md).

## Basic Usage

```js
var Generator = require('static-assets/generator');

var g = new Generator({
  // The namespace that apps consuming these generated assets
  // will use when using the SDK.
  namespace : 'BV',

  // The destination where the assets will be deployed;
  // required only if you intend to call the `deploy` method
  // of the generator instance.
  dest : 's3://origin-bv-firebird-prod/common/static-assets/1/'

  // The assets that need to be supported for each application.
  // Each asset must have a corresponding file in the assets
  // directory. For example, for the asset jquery-bv@1.11.1,
  // there must be a file assets/jquery-bv/1.11.1.js.
  assets : {
    firebird : [
      'jquery-bv@1.11.1',
      'backbone-bv@1.0.0',
      'lodash-bv@1.2.0'
    ],
    curations : [
      'jquery-bv@1.11.1',
      'underscore@1.5.2'
    ],
    spotlights : [
      'backbone-bv@1.2.0',
      'lodash@2.4.1'
    ]
  },

  // The directory where assets should be created locally;
  // useful for testing or if you want to otherwise manipulate the
  // assets prior to deployment, but not necessary. If this value
  // isn't specified, an ephemeral temp directory will be created.
  tmp : null,

  // Whether the assets should be uglified. If this option
  // is true, they will not be uglified; it is false by default.
  pretty : false
});

g.create().then(g.deploy.bind(g), function (err) {
  console.log(err);
});
```

### About the namespace

The nature of the static asset service is that it requires a global namespace -- that is, a property on `window` -- that it can use to communicate back to the apps that request assets. When generating files, this namespace needs to be known in order to property wrap the individual assets in a callback.

For example, if the specified namespace is `'BV'`, then each asset will be wrapped in a call to `BV._staticAssetRegistry.define()`.
