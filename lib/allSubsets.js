'use strict';

// http://stackoverflow.com/questions/5752002/find-all-possible-subset-combos-in-an-array
module.exports = function allSubsets (arr) {
  var min = 1;

  var fn = function (n, src, got, all) {
    if (n === 0) {
      if (got.length > 0) {
        all[all.length] = got;
      }
      return;
    }

    for (var j = 0; j < src.length; j++) {
      fn(n - 1, src.slice(j + 1), got.concat([src[j]]), all);
    }

    return;
  };

  var all = [];

  for (var i = min; i < arr.length; i++) {
    fn(i, arr, [], all);
  }

  all.push(arr);
  return all;
};
