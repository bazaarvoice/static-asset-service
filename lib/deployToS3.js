/**
 * @fileOverview Deploy generated asset filePaths to S3.
 */

// Core.
var path = require('path');
var util = require('util');

// NPM.
var async = require('async');
var glob = require('glob');
var _ = require('lodash');
var semver = require('semver');

// Local.
var uploadToS3 = require('./uploadToS3');

/**
 * Deploy the generated asset filePaths to S3.
 *
 * Assets filePaths are deployed to several subdirectories based on the provided
 * semver version. E.g. If version is 1.2.3, then the assets are deployed to
 *
 * keyPrefix/1.2.3
 * keyPrefix/1.2
 * keyPrefix/1
 *
 * @param {Object} config Configuration information.
 * @param {String} config.version A semver version.
 * @param {String} config.sourceDir The source directory containing generated
 *   asset filePaths.
 * @param {String} config.bucket The destination bucket.
 * @param {String} config.keyPrefix A directory path prefix for the uploaded
 *   filePaths , e.g. 'path/to/assets'.
 * @param {Boolean} log If true, log progress to console.
 * @param {Object} [config.s3ClientConfig] Optional configuration that will be
 *   passed to the S3 client.
 * @param {Function} callback Of the form function (error).
 */
module.exports = function (config, callback) {
  try {
    // The semver constructor may throw or return null.
    if (!semver(config.version)) {
      throw new Error();
    }
  }
  catch (e) {
    return callback(new Error('config.version must have a valid semver format.'));
  }
  if (!config.sourceDir) {
    return callback(new Error('config.sourceDir must be provided'));
  }
  if (!config.bucket) {
    return callback(new Error('config.bucket must be provided'));
  }
  if (!config.keyPrefix) {
    return callback(new Error('config.keyPrefix must be provided'));
  }

  var major = semver.major(config.version);
  var minor = semver.minor(config.version);
  var patch = semver.patch(config.version);

  var keyPrefixes = [];

  if (typeof major === 'number') {
    keyPrefixes.push(path.join(config.keyPrefix, major.toString()) + '/');
  }
  if (typeof minor === 'number') {
    keyPrefixes.push(path.join(config.keyPrefix, major.toString() + '.' + minor.toString()) + '/');
  }
  if (typeof patch === 'number') {
    keyPrefixes.push(path.join(config.keyPrefix, major.toString() + '.' + minor.toString() + '.' + patch.toString()) + '/');
  }

  // Catch odd config versions like x.y.z-a.
  keyPrefixes.push(path.join(config.keyPrefix, config.version) + '/');
  keyPrefixes = _.uniq(keyPrefixes);

  var contentTypes = {
    '.js': 'application/javascript',
    '.map': 'application/json'
  };

  var filePaths = [];

  async.series({
    loadJsFiles: function (asyncCallback) {
      glob(config.sourceDir + '/*.js', function (error, jsFilePaths) {
        if (error) {
          return asyncCallback(error);
        }

        if (!jsFilePaths.length) {
          return asyncCallback(new Error(util.format(
            'No Javascript files found under %s. Is this source directory correct?',
            config.sourceDir
          )));
        }

        filePaths = filePaths.concat(jsFilePaths);
        asyncCallback();
      });
    },

    loadMapFiles: function (asyncCallback) {
      glob(config.sourceDir + '/*.map', function (error, mapFilePaths) {
        if (error) {
          return asyncCallback(error);
        }

        if (!mapFilePaths.length) {
          return asyncCallback(new Error(util.format(
            'No map files found under %s. Is this source directory correct?',
            config.sourceDir
          )));
        }

        filePaths = filePaths.concat(mapFilePaths);
        asyncCallback();
      });
    },

    uploadFiles: function (asyncCallback) {
      var optionsObjects = [];

      // Expand out paths into upload options objects to pass to uploadToS3.
      _.each(filePaths, function (filePath) {
        _.each(keyPrefixes, function (keyPrefix) {
          optionsObjects.push({
            bucket: config.bucket,
            contentType: contentTypes[path.extname(filePath)],
            filePath: filePath,
            key: keyPrefix + path.basename(filePath),
            log: config.log,
            s3ClientOptions: config.s3ClientOptions
          });
        });
      });

      // Run the uploads in sequence, not in parallel.
      async.eachSeries(optionsObjects, uploadToS3, asyncCallback);
    }
  }, callback);
};
