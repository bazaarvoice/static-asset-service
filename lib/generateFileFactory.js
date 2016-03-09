/**
 * @fileOverview Factory to create file generation functions.
 */

var fs = require('fs-extra');
var Q = require('q');
var path = require('path');
var concat = require('concat-files');
var pkg = require('../package.json');

/**
 * Generate a function to generate files.
 *
 * @param {String} sourceDir Absolute path to the assets directory.
 * @param {String} targetDir Absolute path to the local build directory.
 * @param {String} namespaceName The namespace name that clients will use.
 * @return {Function} A generator function of the form function (assetNames).
 */
module.exports = function (sourceDir, targetDir, namespaceName) {
  /**
   * Generate a file given the ordered asset names.
   *
   * @param {String} assetNames An alphanumeric array of asset names.
   * @return {Promise} A promise.
   */
  return function (assetNames) {
    var dfd = Q.defer();
    var promise = dfd.promise;
    var filename = assetNames.join('+') + '.js';
    var destination = path.resolve(targetDir, filename);
    var absoluteFiles = assetNames.map(function (assetName) {
      return path.resolve(sourceDir, assetName + '.js');
    });
    var options = { encoding: 'utf8' };

    concat(
      absoluteFiles,
      destination,
      function (err) {
        if (err) {
          return dfd.reject(err);
        }

        fs.readFile(destination, options, function (err, src) {
          if (err) {
            dfd.reject(err);
          }

          // Provide the namespace via an IIFE.
          src = '/* version:' + pkg.version + ' */\n' +
          '/* date:' + new Date() + ' */\n' +
          '(function (define) {\n' +
            src +
          '}(window.' + namespaceName + '._staticAssetRegistry.define));';

          fs.writeFile(destination, src, options, function (err) {
            if (err) {
              return dfd.reject(err);
            }

            dfd.resolve();
          });
        });
      }
    );

    return promise;
  };
};
