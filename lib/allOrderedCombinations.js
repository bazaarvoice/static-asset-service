/**
 * @fileOverview Utility to find all ordered subset combinations in an array.
 */

// NPM.
var jsc = require('js-combinatorics');
var _ = require('lodash');

/**
 * @fileOverview Utility to find all ordered subset combinations in an array.
 *
 * This uses a standard combination library, and then filters the combinations
 * to only pick those with the same ordering as the provided array.
 *
 * i.e. given ['a', 'b'], the results are:
 *
 * [
 *   ['a'],
 *   ['b'],
 *   ['a', 'b']
 * ]
 *
 * Since ['b', 'a'] is out of order.
 *
 * Combinations explode pretty quickly for larger arrays.
 *
 * @param {String[]} assetNames The assets to be combined.
 * @returns {Object[]} An array of arrays of asset names.
 */
module.exports = function allOrderedCombinations (assetNames) {
  var combinations = [];

  for (var index = 1; index <= assetNames.length; index++) {
    combinations = combinations.concat(
      jsc.combination(assetNames, index).toArray()
    );
  }

  combinations = combinations.map(function (combination) {
    return combination.sort();
  });

  // Strip out all the duplicates now that they have been ordered.
  return _.uniqWith(combinations, function (a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  });
};
