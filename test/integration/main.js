/* global describe:false, chai:false, mocha:false, it:false */
'use strict';

function getScript (url) {
  var s = document.createElement('script');
  s.src = url;
  document.body.appendChild(s);
}

window.TEST = {};

var sdk = require('../../sdk');

var staticAssets1 = sdk({
  loader : getScript,
  namespace : window.TEST,
  baseUrl : 'http://localhost:9999/assets/'
});

var staticAssets2 = sdk({
  loader : getScript,
  namespace : window.TEST,
  baseUrl : 'http://localhost:9999/assets/',
  debug : true
});

staticAssets1.require([
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

    describe('requiring already-required assets', function () {
      it('should work', function (done) {
        staticAssets2.require([
          'asset-without-dependency@1.0.0'
        ], function (withoutDependency) {
          expect(withoutDependency).to.equal('asset-without-dependency');
          done();
        });
      });
    });
  });


  mocha.run();
});
