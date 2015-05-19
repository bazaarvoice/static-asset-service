'use strict';

/**
 * This file generates files in a directory based on configuration.
 */
var assert = require('assert');

var _ = require('lodash');
var Q = require('q');
var fs = require('fs-extra');

var generateFile = require('../lib/generateFile');
var allSubsets = require('../lib/allSubsets');

/**
 * Generates the files required to support the specified dependencies, using
 * files from the specified source directory and outputting files to the
 * specified target directory.
 *
 * @param  {object} config                Configuration information
 * @param  {object} config.dependencies   An object where the property names
 *                                        are application names, and the values
 *                                        are an array of dependencies.
 * @param  {string} config.sourceDir      An absolute path to a directory
 *                                        where the specified dependencies
 *                                        can be found.
 * @param  {string} config.targetDir      An absolute path to a directory
 *                                        where the generated files should
 *                                        be created.
 * @return {promise}                      A promise that is resolved when the
 *                                        file generation is complete, and
 *                                        rejected when there is an error.
 */
module.exports = function (config) {
  assert(config.dependencies, 'config.dependencies must be provided');
  assert(config.sourceDir, 'config.sourceDir must be provided');
  assert(config.targetDir, 'config.targetDir must be provided');
  assert(config.namespace, 'config.namespace must be provided');

  fs.ensureDirSync(config.targetDir);
  fs.emptyDirSync(config.targetDir);

  var results = [];

  _.each(config.dependencies, function (deps) {
    var subsets = allSubsets(deps).map(function (arr) {
      return arr.sort();
    });

    results = results.concat(subsets);
  });

  results = _.uniq(results, function (r) {
    return r.join();
  });

  return Q.all(results.map(
    generateFile(config.sourceDir, config.targetDir, config.namespace)
  ));
};
