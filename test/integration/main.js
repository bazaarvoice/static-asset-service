/* global describe:false, chai:false, mocha:false, it:false */
'use strict';

function getScript (url) {
  var s = document.createElement('script');
  s.src = url;
  document.body.appendChild(s);
}

var staticAssets = require('../../sdk')({
  loader : getScript,
  namespace : 'TEST',
  baseUrl : 'http://localhost:9999/assets/'
});

staticAssets.require([
  'asset-with-dependency@1.0.0',
  'asset-without-dependency@1.0.0'
], function (withDependency, withoutDependency) {
  var expect = chai.expect;

  describe('integration', function () {
    describe('asset with dependency', function () {
      it('executes the module code', function () {
        expect(document.getElementById('div2').innerHTML).
          to.equal('asset-with-dependency');
      });

      it('exports the proper module', function () {
        expect(withDependency.it).to.equal('works');
      });

      it('receives its dependency', function () {
        expect(document.getElementById('div1').innerHTML).
          to.equal('asset-without-dependency');
      });
    });

    describe('asset without dependency', function () {
      it('exports the proper module', function () {
        expect(withoutDependency).to.equal('asset-without-dependency');
      });
    });
  });

  mocha.run();
});
