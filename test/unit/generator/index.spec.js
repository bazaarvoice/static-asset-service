/* global describe, it */
/**
 * @fileOverview Unit tests for the generator.
 */

// Core.
var assert = require('assert');

// NPM.
var fs = require('fs-extra');
var path = require('path');

// Local.
var generate = require('../../../generator');
var resources = require('../resources');

var assetBundles = {
  app1: [
    'asset-two@1.0.0'
  ],
  app2: [
    'asset-one@1.0.0',
    'asset-two@1.0.0'
  ]
};

var assetDir = path.resolve(__dirname, '../../fixtures/assets');

describe('generator', function () {
  var targetDir;

  beforeEach(function () {
    targetDir = resources.getTargetDir();
  });

  afterEach(function () {
    fs.removeSync(targetDir);
  });

  describe('configuration', function () {
    it('requires an assetBundles object', function () {
      assert.throws(function () {
        generate({
          namespaceName: 'TEST',
          sourceDir: 'doesntmatter',
          targetDir: 'doesntmatter'
        });
      });
    });

    it('requires a sourceDir', function () {
      assert.throws(function () {
        generate({
          namespaceName: 'TEST',
          targetDir: 'doesntmatter',
          assetBundles: {}
        });
      });
    });

    it('requires a targetDir', function () {
      assert.throws(function () {
        generate({
          namespaceName: 'TEST',
          sourceDir: 'doesntmatter',
          assetBundles: {}
        });
      });
    });

    it('requires a namespaceName', function () {
      assert.throws(function () {
        generate({
          sourceDir: 'doesntmatter',
          targetDir: 'doesntmatter',
          assetBundles: {}
        });
      });
    });
  });

  describe('filesystem preparation', function () {
    it('ensures an empty destination directory', function () {
      fs.writeFileSync(path.resolve(targetDir, 'tmp.txt'), 'temp');

      generate({
        assetBundles: assetBundles,
        sourceDir: 'doesntmatter',
        targetDir: targetDir,
        namespaceName: 'TEMP'
      });

      assert(fs.existsSync(targetDir));
      assert(!fs.existsSync(path.resolve(targetDir, 'tmp.txt')));
    });
  });

  describe('asset files', function () {
    it('creates the required files, and not reverse order files', function (done) {
      generate({
        assetBundles: assetBundles,
        sourceDir: assetDir,
        targetDir: targetDir,
        namespaceName: 'namespaceName'
      }).then(function () {
        assert(fs.existsSync(
          path.resolve(targetDir, 'asset-two@1.0.0.js')
        ));

        assert(fs.existsSync(
          path.resolve(targetDir, 'asset-one@1.0.0.js')
        ));

        assert(fs.existsSync(
          path.resolve(targetDir,
            'asset-one@1.0.0+asset-two@1.0.0.js')
        ));

        assert(!fs.existsSync(
          path.resolve(targetDir,
            'asset-two@1.0.0+asset-one@1.0.0.js')
        ));

        done();
      }, function (err) {
        done(err);
      });
    });
  });
});
