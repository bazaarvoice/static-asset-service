/**
 * @fileOverview Unit tests for lib/allOrderedCombinations.
 */

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

    expect(actual).to.eql(expected);
  });
});
