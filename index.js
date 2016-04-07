/**
 * @fileOverview Programmatic interface for the module.
 */

/**
 * Asset generation function.
 *
 * See the file for function documentation.
 */
exports.generate = require('./lib/generate');

/**
 * Deploy to S3 function.
 *
 * See the file for function documentation.
 */
exports.deployToS3 = require('./lib/deployToS3');
