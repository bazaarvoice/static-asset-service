# Static Asset Service

This repository supports the generator and assets for a static asset service:

- [Generator](./generator): A tool for generating compiled asset files and
deploying the files to S3.
- [Assets](./assets): The assets that the service provides.

The static asset client that is used to require and define assets in a
Javascript browser application is defined [in the bv-ui-core repository][2].

The original idea for this repo was [documented in a gist][1].

## Getting Started

Developers should run `npm install` before doing any work on this repository.
This will install the project dependencies, as well as a pre-push hook.

## Running the Tests

`grunt test` will run the browser tests using PhantomJS, as well as ESLint and
the tests of the generator code.

`grunt serve` will open a browser to show the browser tests.

## Generating the Asset Files

`grunt dist` will generate the files in the dist directory of the repo.

## Deploying the Generated Asset Files

Presently, you must have AWS keys for the Conversations AWS account in order to
perform a deployment. (In the future, this may use a Nexus bucket instead).
Assuming that you have properly exported the required AWS environment variables,
you can then run the following:

```
grunt deploy
```

This will build the files for distribution, then deploy them to *all hosts*. You
can specify a single host:

```
grunt deploy:<environment>
```

The `<environment>` value must be `test`, `qa`, or `prod`.

[1]: https://gist.github.com/rmurphey/6842b3b1b806dd123676
[2]: https://github.com/bazaarvoice/bv-ui-core/tree/master/lib/staticAssetLoader
