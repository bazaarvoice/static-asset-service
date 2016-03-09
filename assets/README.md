# Assets

This directory contains the assets provided by the static asset service.

## File Names

Asset files must have names in the format: `<resource>@<version>.js`.

## File Contents

Asset files should contain valid JavaScript, structured as follows:

```js
define('<resource>@<version>', function () {

  // ...

  return resource;
});
```
