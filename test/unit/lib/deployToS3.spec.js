/**
 * @fileOverview Unit tests for lib/deployToS3.
 */

// Core.
var path = require('path');

// NPM.
var fs = require('fs-extra');
var _ = require('lodash');

// Local.
var deployToS3 = require('../../../lib/deployToS3');
var generate = require('../../../lib/generate');
var uploadToS3 = require('../../../lib/uploadToS3');

describe('lib/deployToS3', function () {
  var sandbox;
  var options;
  var assetBundles;
  var assetDir;
  var distDir;

  before(function (done) {
    assetBundles = {
      app1: [
        'asset-two@1.0.0'
      ],
      app2: [
        'asset-one@1.0.0',
        'asset-two@1.0.0'
      ]
    };
    assetDir = path.resolve(__dirname, '../../fixtures/assets');
    distDir = path.resolve(__dirname, '../../scratch/assets');
    emptyDir = path.resolve(__dirname, '../../scratch/empty');

    fs.ensureDirSync(emptyDir);

    generate({
      assetBundles: assetBundles,
      sourceDir: assetDir,
      targetDir: distDir,
      namespaceName: 'namespaceName',
      uglify: true,
      log: false
    }, done);
  });

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    uploadToS3.s3Client = {
      putObject: function () {}
    };

    options = {
      bucket: 'example',
      keyPrefix: 'prefix',
      log: false,
      sourceDir: distDir,
      version: '3.0.0',
    };

    sinon.stub(uploadToS3.s3Client, 'putObject').yields();
  });

  afterEach(function () {
    sandbox.restore();

    delete uploadToS3.s3Client;
  });

  describe('configuration', function () {
    it('requires a valid version', function (done) {
      options.version = 'invalid';
      deployToS3(options, function (error) {
        expect(error).to.be.instanceOf(Error);
        done();
      });
    });
    it('requires a bucket', function (done) {
      options.bucket = undefined;
      deployToS3(options, function (error) {
        expect(error).to.be.instanceOf(Error);
        done();
      });
    });
    it('requires a key prefix', function (done) {
      options.keyPrefix = undefined;
      deployToS3(options, function (error) {
        expect(error).to.be.instanceOf(Error);
        done();
      });
    });
    it('requires a source directory', function (done) {
      options.sourceDir = undefined;
      deployToS3(options, function (error) {
        expect(error).to.be.instanceOf(Error);
        done();
      });
    });
  });

  describe('functionality', function () {
    it('fails for an empty directory', function () {
      options.sourceDir = emptyDir;

      deployToS3(options, function (error) {
        expect(error).to.be.instanceOf(Error);
        done();
      });
    });

    it('fails for an invalid directory', function () {
      options.sourceDir = path.resolve(__dirname, 'not-a-dir');

      deployToS3(options, function (error) {
        expect(error).to.be.instanceOf(Error);
        done();
      });
    });

    it('is as expected', function (done) {
      var assetKeys = _.map([
        '/3/asset-one@1.0.0.js',
        '/3.0/asset-one@1.0.0.js',
        '/3.0.0/asset-one@1.0.0.js',
        '/3/asset-one@1.0.0+asset-two@1.0.0.js',
        '/3.0/asset-one@1.0.0+asset-two@1.0.0.js',
        '/3.0.0/asset-one@1.0.0+asset-two@1.0.0.js',
        '/3/asset-two@1.0.0.js',
        '/3.0/asset-two@1.0.0.js',
        '/3.0.0/asset-two@1.0.0.js',
        '/3/asset-one@1.0.0.js.map',
        '/3.0/asset-one@1.0.0.js.map',
        '/3.0.0/asset-one@1.0.0.js.map',
        '/3/asset-one@1.0.0+asset-two@1.0.0.js.map',
        '/3.0/asset-one@1.0.0+asset-two@1.0.0.js.map',
        '/3.0.0/asset-one@1.0.0+asset-two@1.0.0.js.map',
        '/3/asset-two@1.0.0.js.map',
        '/3.0/asset-two@1.0.0.js.map',
        '/3.0.0/asset-two@1.0.0.js.map'
      ], function (key) {
        return options.keyPrefix + key;
      });;

      deployToS3(options, function (error) {
        sinon.assert.callCount(uploadToS3.s3Client.putObject, 18);

        _.each(assetKeys, function (assetKey, index) {

          var ext = path.extname(assetKey);
          var contentType;
          if (ext === '.js') {
            contentType = 'application/javascript';
          }
          else {
            contentType = 'application/json';
          }

          var params = uploadToS3.s3Client.putObject.getCall(index).args[0];
          expect(params.ACL).to.equal('public-read');
          expect(params.Body).to.be.instanceOf(fs.ReadStream);
          expect(params.Bucket).to.equal(options.bucket);
          expect(params.CacheControl).to.equal('max-age=2592000')
          expect(params.ContentType).to.equal(contentType);
          expect(params.Key).to.equal(assetKeys[index]);
        });

        done(error);
      });
    });
  })

});
