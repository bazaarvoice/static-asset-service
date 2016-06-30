/**
 * @fileOverview Utility for uploading single files to S3.
 */

// Core.
var util = require('util');

// NPM.
var async = require('async');
var AWS = require('aws-sdk');
var fs = require('fs-extra');

/**
 * Obtain an S3 client.
 *
 * @param {Object} [s3ClientOptions] Optional S3 client options.
 * @return {AWS.S3}
 */
function getS3Client (s3ClientOptions) {
  if (!module.exports.s3Client) {
    if (s3ClientOptions) {
      module.exports.s3Client = new AWS.S3(s3ClientOptions);
    }
    else {
      module.exports.s3Client = new AWS.S3();
    }
  }

  return module.exports.s3Client;
}

/**
 * Helper function to wrap uploading a single file to S3.
 *
 * @param {Object} options
 * @param {String} options.bucket The S3 bucket.
 * @param {String} options.contentType The MIME content type for the file.
 * @param {String} options.filePath Absolute path to the file to be uploaded.
 * @param {String} options.key The S3 key for the file.
 * @param {Boolean} log If true, log progress to console.
 * @param {String} [options.s3ClientOptions] Optional options for the S3 client.
 * @param {Function} callback Of the form function (error).
 */
module.exports = function uploadToS3 (options, callback) {
  var params = {
    ACL: 'public-read',
    Body: fs.createReadStream(options.filePath),
    Bucket: options.bucket,
    CacheControl: 'max-age=2592000',
    // Not strictly necessary, but helpful for human inspection.
    ContentType: options.contentType,
    ContentEncoding: options.contentEncoding,
    Key: options.key
  };

  var s3Client = getS3Client(options.s3ClientOptions);

    // S3 uploads are flaky enough to always need a retry.
  async.retry(3, function (asyncCallback) {
    if (options.log) {
      console.info(util.format(
        'Uploading %s to s3://%s/%s...',
        options.filePath,
        options.bucket,
        options.key
      ));
    }

    s3Client.putObject(params, function (error) {
      if (error && options.log) {
        console.error(util.format(
          'Upload failed: %s',
          error.message || error.stack
        ));
      }

      asyncCallback(error);
    });
  }, callback);
};
