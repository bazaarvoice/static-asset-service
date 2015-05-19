# Assets

This directory contains the assets that are provided by the service.

## File names

Files must be named as `<resource>@<version>.js`.

## File contents

Files should contain valid JavaScript, structured as follows:

```js
define('<resource>@<version>', function () {
  // ...
  return resource;
});
```

Files with dependencies must specify those dependencies, including the
specific version required:

```js
define('<resource>@<version>', [
  'dependencyA@1.0.0',
  'dependencyB@1.1.1'
], function (dependencyA, dependencyB) {
  // ...
  return resource;
});
```
