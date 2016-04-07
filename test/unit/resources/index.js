/**
 * @fileOverview Unit test utilities.
 */

// Core.
var path = require('path');

// NPM.
var fs = require('fs-extra');

exports.getTargetDir = function () {
  var tmp = new Date().getTime() + Math.random() + '';
  var dir = path.resolve(__dirname, '../../scratch', tmp);
  fs.ensureDirSync(dir);
  return dir;
}
