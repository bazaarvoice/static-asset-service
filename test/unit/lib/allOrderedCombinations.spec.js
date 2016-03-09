/* global describe, it */
/**
 * @fileOverview Unit tests for lib/allOrderedCombinations.
 */

// Core.
var assert = require('assert');

// Local.
var allOrderedCombinations = require('../../../lib/allOrderedCombinations');

describe('lib/allOrderedCombinations', function () {
  it('functions as expected', function () {
    var assetNames = ['a', 'b', 'c'];
    var expected = [
      [ 'a' ],
      [ 'b' ],
      [ 'c' ],
      [ 'a', 'b' ],
      [ 'a', 'c' ],
      [ 'b', 'c' ],
      [ 'a', 'b', 'c' ]
    ];
    var actual = allOrderedCombinations(assetNames);

    assert.deepEqual(actual, expected);
  });
});
