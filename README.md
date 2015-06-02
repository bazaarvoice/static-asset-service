# Static Asset Service

This repository supports a static asset service:

- [Client-Side SDK](./sdk/README.md): A tool for client-side applications to use to request assets from the service, to be included in an application's scout file.
- [Generator](./generator/README.md): A tool for generating the compiled asset files, used to power the `grunt dist` task.
- [Assets](./assets/README.md): The assets that the service provides.

## Getting started

Developers should run `npm install` before doing any work on this repository. This will install the project dependencies, as well as a pre-push hook.

## Running the tests

`grunt test` will run the browser tests using PhantomJS, as well as ESLint and the tests of the generator code.

`grunt serve` will open a browser to show the browser tests.

## Generating the asset files

`grunt dist` will generate the files in the dist directory of the repo.

## Deploying the generated asset files

*Not yet implemented.*
