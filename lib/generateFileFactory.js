/**
 * @fileOverview Factory to create file generation functions.
 */

// Core.
var path = require('path');
var util = require('util');

// NPM.
var async = require('async');
var fs = require('fs-extra');
var concat = require('concat-files');
var uglifyJs2 = require('uglify-js2');
var zlib = require('zlib');

// Local.
var pkg = require('../package.json');

/**
 * Generate a function to generate files.
 *
 * @param {String} sourceDir Absolute path to the assets directory.
 * @param {String} targetDir Absolute path to the local build directory.
 * @param {String} namespaceName The namespace name that clients will use.
 * @param {Boolean} uglify If true, uglify the generated files.
 * @param {Boolean} log If true, log results to console.
 * @return {Function} A generator function of the form function (assetNames).
 */
module.exports = function (sourceDir, targetDir, namespaceName, uglify, log, compress) {
  /**
   * Generate a file given the ordered asset names.
   *
   * @param {String} assetNames An alphanumeric array of asset names.
   * @param {Function} callback Of the form function (error).
   */
  return function (assetNames, callback) {
    var filename = assetNames.join('+') + '.js';
    var destination = path.resolve(targetDir, filename);
    var sourceMapDestination = destination + '.map';
    var absoluteFiles = assetNames.map(function (assetName) {
      return path.resolve(sourceDir, assetName + '.js');
    });
    var options = { encoding: 'utf8' };

    var contents;
    var result;

    if (log) {
      console.info(util.format('Generating %s...', destination));
    }

    async.series({
      concat: function (asyncCallback) {
        concat(absoluteFiles, destination, asyncCallback);
      },
      readFile: function (asyncCallback) {
        fs.readFile(destination, options, function (error, loadedContents) {
          if (error) {
            return asyncCallback(error);
          }

          // Provide the namespace via an IIFE.
          contents = '/* version:' + pkg.version + ' */\n' +
          '/* date:' + new Date() + ' */\n' +
          '(function (define) {\n' +
            loadedContents +
          '}(window.' + namespaceName + '._staticAssetRegistry.define));';

          asyncCallback();
        });
      },
      uglify: function (asyncCallback) {
        if (!uglify) {
          return asyncCallback();
        }

        result = uglifyJs2.minify(contents, {
          compress: {
            sequences: true,
            dead_code: true,
            conditionals: true,
            booleans: true,
            unused: true,
            if_return: true,
            join_vars: true,
            drop_console: true
          },
          fromString: true,
          mangle: true,
          // The map is in the same directory, and thus we just need the name.
          // Besides, we don't want the local path making it out.
          outSourceMap: path.basename(destination)
        });

        // Getting the map to work; doesn't seem to be a way to get it to show
        // the right filename for the sources property.
        result.map = result.map.replace(
          /"sources":\["[^"]*"\]/,
          '"sources":["' + encodeURIComponent(path.basename(destination)) + '"]'
        );

        asyncCallback();
      },
      compress: function (asyncCallback) {
        if (!compress) {
          return asyncCallback();
        }
        if (uglify) {
          async.parallel([
            function (done) {
              zlib.gzip(result.code, function (err, zippedResult) {
                if (err) {
                  return done(err);
                }
                result.code = zippedResult;
                done();
              });
            },
            function (done) {
              zlib.gzip(result.map, function (err, zippedResult) {
                if (err) {
                  return done(err);
                }
                result.map = zippedResult;
                done();
              });
            }
          ], asyncCallback);
        }
        else {
          zlib.gzip(contents, function (err, zippedResult) {
            if (err) {
              return asyncCallback(err);
            }
            contents = zippedResult;
            asyncCallback();
          });
        }
      },
      writeFile: function (asyncCallback) {
        // If the uglify flag isn't preset, just write the raw namespace wrapped contents.
        var contentToWrite = uglify ? result.code : contents;
        fs.writeFile(destination, contentToWrite, options, asyncCallback);
      },
      writeSourceMapFile: function (asyncCallback) {
        if (!uglify) {
          return asyncCallback();
        }

        fs.writeFile(sourceMapDestination, result.map, options, asyncCallback);
      }
    }, function (error) {
      if (error && log) {
        console.error(util.format(
          'Generation failed: %s',
          error.stack
        ));
      }

      callback(error);
    });
  };
};
