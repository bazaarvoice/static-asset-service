/* global afterEach, beforeEach, describe, it */
/**
 * @fileOverview Unit tests for lib/uploadToS3.
 */

// NPM.
var fs = require('fs-extra');

// Local.
var uploadToS3 = require('../../../lib/uploadToS3');

describe('lib/uploadToS3', function () {
  var sandbox;
  var options;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    uploadToS3.s3Client = {
      putObject: function () {}
    };

    sinon.stub(uploadToS3.s3Client, 'putObject').yields();

    options = {
      bucket: 'bucket',
      contentType: 'application/javascript',
      filePath: __filename,
      key: 'key',
      log: false,
      s3ClientOptions: {}
    };
  });

  afterEach(function () {
    sandbox.restore();

    delete uploadToS3.s3Client;
  });

  it('functions as expected', function (done) {
    uploadToS3(options, function (error) {
      sinon.assert.calledWith(
        uploadToS3.s3Client.putObject,
        sinon.match.object,
        sinon.match.func
      );

      var params = uploadToS3.s3Client.putObject.getCall(0).args[0];
      expect(params.ACL).to.equal('public-read');
      expect(params.Body).to.be.instanceOf(fs.ReadStream);
      expect(params.Bucket).to.equal(options.bucket);
      expect(params.CacheControl).to.equal('max-age=2592000')
      expect(params.ContentType).to.equal(options.contentType);
      expect(params.Key).to.equal(options.key);

      done(error);
    });
  });

  it('retries on error', function (done) {
    uploadToS3.s3Client.putObject.onCall(0).yields(new Error());

    uploadToS3(options, function (error) {
      sinon.assert.calledTwice(uploadToS3.s3Client.putObject);
      done(error);
    });
  });

  it('calls back with error', function (done) {
    uploadToS3.s3Client.putObject.yields(new Error());

    uploadToS3(options, function (error) {
      expect(error).to.be.instanceOf(Error);
      done();
    });
  });
});
