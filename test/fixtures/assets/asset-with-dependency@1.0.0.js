/* global define */
'use strict';

define('asset-with-dependency@1.0.0', [
  'asset-without-dependency@1.0.0'
], function (dep) {
  var div1 = document.createElement('div');
  div1.innerHTML = dep;
  div1.id = 'div1';
  document.body.appendChild(div1);

  var div2 = document.createElement('div');
  div2.innerHTML = 'asset-with-dependency';
  div2.id = 'div2';
  document.body.appendChild(div2);

  return {
    it : 'works'
  };
});
