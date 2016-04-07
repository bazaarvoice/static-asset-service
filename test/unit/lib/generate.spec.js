/**
 * @fileOverview Unit tests for the generator.
 */

// NPM.
var fs = require('fs-extra');
var path = require('path');

// Local.
var generate = require('../../../lib/generate');
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
    it('requires an assetBundles object', function (done) {
      generate({
        namespaceName: 'TEST',
        sourceDir: assetDir,
        targetDir: targetDir,
        uglify: true,
        log: false
      }, function (error) {
        expect(error).to.be.instanceOf(Error);
        done();
      });
    });

    it('requires a sourceDir', function (done) {
      generate({
        namespaceName: 'TEST',
        targetDir: targetDir,
        assetBundles: {},
        uglify: true,
        log: false
      }, function (error) {
        expect(error).to.be.instanceOf(Error);
        done();
      });
    });

    it('requires a targetDir', function (done) {
      generate({
        namespaceName: 'TEST',
        sourceDir: assetDir,
        assetBundles: {},
        uglify: true,
        log: false
      }, function (error) {
        expect(error).to.be.instanceOf(Error);
        done();
      });
    });

    it('requires a namespaceName', function (done) {
      generate({
        sourceDir: assetDir,
        targetDir: targetDir,
        assetBundles: {},
        uglify: true,
        log: false
      }, function (error) {
        expect(error).to.be.instanceOf(Error);
        done();
      });
    });
  });

  describe('filesystem preparation', function () {
    it('ensures an empty destination directory', function (done) {
      fs.writeFileSync(path.resolve(targetDir, 'tmp.txt'), 'temp');

      generate({
        assetBundles: assetBundles,
        sourceDir: assetDir,
        targetDir: targetDir,
        namespaceName: 'TEMP',
        uglify: true,
        log: false
      }, function (error) {
        expect(fs.statSync(targetDir).isDirectory()).to.equal(true);
        expect(function () {
          fs.statSync(path.resolve(targetDir, 'tmp.txt'))
        }).to.throw();
        done(error);
      });

    });
  });

  describe('asset files', function () {
    it('creates the required files, and not reverse order files', function (done) {
      generate({
        assetBundles: assetBundles,
        sourceDir: assetDir,
        targetDir: targetDir,
        namespaceName: 'namespaceName',
        uglify: true,
        log: false
      }, function (error) {
        expect(fs.existsSync(
          path.resolve(targetDir, 'asset-two@1.0.0.js')
        )).to.equal(true);

        expect(fs.existsSync(
          path.resolve(targetDir, 'asset-one@1.0.0.js')
        )).to.equal(true);

        expect(fs.existsSync(
          path.resolve(targetDir,
            'asset-one@1.0.0+asset-two@1.0.0.js')
        )).to.equal(true);

        expect(fs.existsSync(
          path.resolve(targetDir,
            'asset-two@1.0.0+asset-one@1.0.0.js')
        )).to.equal(false);

        done(error);
      });
    });
  });
});
