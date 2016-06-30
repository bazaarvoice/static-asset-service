/* global afterEach, beforeEach, describe, it */
/**
 * @fileOverview Unit tests for lib/generateFileFactory.
 */

// Core.
var path = require('path');

// NPM.
var fs = require('fs-extra');
var zlib = require('zlib');

// Local.
var generateFileFactory = require('../../../lib/generateFileFactory');
var resources = require('../resources');

describe('lib/generateFileFactory', function () {
  var targetDir;

  beforeEach(function () {
    targetDir = resources.getTargetDir();
  });

  afterEach(function () {
    //fs.removeSync(targetDir);
  });

  it('functions as expected', function (done) {
    var assetDir = path.resolve(__dirname, '../../fixtures/assets');
    var namespaceName = 'TEST';
    var assetNames = [
      'asset-one@1.0.0',
      'asset-two@1.0.0'
    ];
    var uglify = true;
    var log = false;

    var generateFile = generateFileFactory(
      assetDir,
      targetDir,
      namespaceName,
      uglify,
      log
    );

    generateFile(assetNames, function (error) {
      // Will throw if the file doesn't exist.
      fs.statSync(path.resolve(targetDir, assetNames.join('+') + '.js'));
      done(error);
    });

  });

  it('can compress assets', function (done) {
    var assetDir = path.resolve(__dirname, '../../fixtures/assets');
    var namespaceName = 'TEST';
    var assetNames = [
      'asset-one@1.0.0',
      'asset-two@1.0.0'
    ];
    var uglify = true;
    var log = true;
    var compress = true;

    var generateFile = generateFileFactory(
      assetDir,
      targetDir,
      namespaceName,
      uglify,
      log,
      compress
    );

    generateFile(assetNames, function (error) {
      // Will throw if the file is not gzip.
      zlib.gunzipSync(fs.readFileSync(path.resolve(targetDir, assetNames.join('+') + '.js')));
      done(error);
    });
  });
});
