/* global define */

var div1 = document.createElement('div');
div1.innerHTML = 'testing';
div1.id = 'div1';
document.body.appendChild(div1);

var div2 = document.createElement('div');
div2.innerHTML = 'asset-one';
div2.id = 'div2';
document.body.appendChild(div2);

define('asset-one@1.0.0', {
  it: 'works'
});
