/**
 * @fileOverview Generate files in a directory based on configuration.
 */

// Core.
var assert = require('assert');

// NPM.
var _ = require('lodash');
var Q = require('q');
var fs = require('fs-extra');

// Local.
var generateFileFactory = require('../lib/generateFileFactory');
var allOrderedCombinations = require('../lib/allOrderedCombinations');

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
 * @return {Promise} A promise that is resolved when the file generation is
 *   complete or rejected on an error.
 */
module.exports = function (config) {
  assert(config.assetBundles, 'config.assetBundles must be provided');
  assert(config.sourceDir, 'config.sourceDir must be provided');
  assert(config.targetDir, 'config.targetDir must be provided');
  assert(config.namespaceName, 'config.namespaceName must be provided');

  fs.ensureDirSync(config.targetDir);
  fs.emptyDirSync(config.targetDir);

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

  var generateFile = generateFileFactory(
    config.sourceDir,
    config.targetDir,
    config.namespaceName
  );

  return Q.all(assetNameCombinations.map(generateFile));
};
