/**
 * @fileOverview Generate combined asset files based on configuration.
 */

// NPM.
var async = require('async');
var _ = require('lodash');
var fs = require('fs-extra');

// Local.
var generateFileFactory = require('./generateFileFactory');
var allOrderedCombinations = require('./allOrderedCombinations');

/**
 * Generates the files required to support the specified dependencies, using
 * files from the specified source directory and outputting files to the
 * specified target directory.
 *
 * @param {Object} config Configuration information.
 * @param {Object} config.assetBundles An object where the property names are
 *   application names, and the values are an array of asset names in the
 *   dependency order they should be loaded in.
 * @param {String} config.sourceDir Absolute path to a directory where the
 *   specified asset files can be found.
 * @param {String} config.targetDir Absolute path to a directory where the
 *   generated files will be written.
 * @param {String} config.namespaceName Namespace used by client applications
 *   using the static asset service.
 * @param {Boolean} log If true, log progress to console.
 * @param {Boolean} config.uglify If true, generated files are uglified.
 * @param {Function} callback Of the form function (error).
 */
module.exports = function (config, callback) {
  if (!config.assetBundles) {
    return callback(new Error('config.assetBundles must be provided'));
  }
  if (!config.sourceDir) {
    return callback(new Error('config.sourceDir must be provided'));
  }
  if (!config.targetDir) {
    return callback(new Error('config.targetDir must be provided'));
  }
  if (!config.namespaceName) {
    return callback(new Error('config.namespaceName must be provided'));
  }

  async.series({
    ensureTargetDir: function (asyncCallback) {
      fs.ensureDir(config.targetDir, asyncCallback);
    },
    emptyDir: function (asyncCallback) {
      fs.emptyDir(config.targetDir, asyncCallback);
    },
    generateAll: function (asyncCallback) {
      var generateFile = generateFileFactory(
        config.sourceDir,
        config.targetDir,
        config.namespaceName,
        config.uglify,
        config.log,
        config.compress
      );
      var assetNameCombinations = [];

      _.each(config.assetBundles, function (assetBundle) {
        assetNameCombinations = assetNameCombinations.concat(
          allOrderedCombinations(assetBundle)
        );
      });
      // We may have duplicates due to similar asset bundle contents.
      assetNameCombinations = _.uniq(assetNameCombinations, function (combination) {
        return combination.join();
      });

      async.each(assetNameCombinations, generateFile, asyncCallback);
    }
  }, callback);
};
