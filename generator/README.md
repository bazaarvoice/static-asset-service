# Generator

This directory provides a tool for creating static resources so they can be consumed by the [SDK](../sdk/README.md).

## Basic Usage

```js
var generate = require('static-assets/generator');

var promise = generate({
  // The namespace that apps consuming these generated assets
  // will use when using the SDK.
  namespace : 'BV',

  // The directory where the generator can expect to find the asset files.
  sourceDir : '/Users/rebecca.murphey/code/static-asset-service/assets',

  // The destination where the assets will be created.
  targetDir : '/Users/rebecca.murphey/code/static-assets/service/dist'

  // The assets that need to be supported for each application.
  // Each asset must have a corresponding file in the assets
  // directory. For example, for the asset jquery-bv@1.11.1,
  // there must be a file assets/jquery-bv/1.11.1.js.
  dependencies : {
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
  }
});
```

### About the namespace

The nature of the static asset service is that it requires a global namespace -- that is, a property on `window` -- that it can use to communicate back to the apps that request assets. When generating files, this namespace needs to be known in order to properly provide the individual assets to the requesting application.
