'use strict';

var fs = require('fs-extra');
var Q = require('q');
var path = require('path');
var concat = require('concat-files');

module.exports = function (sourceDir, targetDir, namespace) {
  return function (files) {
    var dfd = Q.defer();
    var promise = dfd.promise;
    var filename = files.join('+') + '.js';
    var destination = path.resolve(targetDir, filename);
    var absoluteFiles = files.map(function (file) {
      return path.resolve(sourceDir, file + '.js');
    });

    concat(
      absoluteFiles,
      destination,
      function (err) {
        if (err) {
          return dfd.reject(err);
        }

        fs.readFile(destination, { encoding : 'utf8' }, function (err, src) {
          if (err) {
            dfd.reject(err);
          }

          // provide the namespace via an IIFE
          src = '(function (define) {\n' +
            src +
          '}(window.' + namespace + '._staticAssetRegistry.define));';

          fs.writeFile(destination, src, function (err) {
            if (err) {
              return dfd.reject(err);
            }

            console.log('wrote', destination);

            dfd.resolve();
          });
        });
      }
    );

    return promise;
  };
};
