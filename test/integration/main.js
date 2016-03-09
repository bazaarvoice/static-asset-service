/* global afterEach: false, beforeEach: false, describe:false, chai:false, sinon: false, mocha:false, it:false */
/**
 * @fileOverview Integration tests.
 */

var staticAssetLoaderFactory = require('bv-ui-core/lib/staticAssetLoader');
var loader = require('bv-ui-core/lib/loader');

var expect = chai.expect;
var namespaceName = 'TEST';
var staticAssetLoader = staticAssetLoaderFactory.create({
  generateUrl: generateUrl,
  namespaceName: namespaceName
});

function generateUrl (assetNames, namespaceName) {
  var filename = encodeURIComponent(assetNames.slice(0).sort().join('+')) + '.js';
  // Not using this here.
  //namespaceName = encodeURIComponent(namespaceName);
  return 'http://localhost:9999/assets/' + filename;
}

staticAssetLoader.require([
  'asset-one@1.0.0',
  'asset-two@1.0.0'
], function (assetOne, assetTwo) {
  var sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('integration', function () {
    describe('asset with dependency', function () {
      it('executes the module code', function () {
        expect(document.getElementById('div2').innerHTML).to.equal('asset-one');
      });

      it('exports the proper module', function () {
        expect(assetOne.it).to.equal('works');
      });

      it('receives its dependency', function () {
        expect(document.getElementById('div1').innerHTML).to.equal('testing');
      });
    });

    describe('asset without dependency', function () {
      it('exports the proper module', function () {
        expect(assetTwo).to.equal('asset-two');
      });
    });

    describe('requiring already-required assets', function () {
      it('works without making another request to load the asset', function (done) {
        sandbox.stub(loader, 'loadScript');

        staticAssetLoader.require([
          'asset-two@1.0.0'
        ], function (assetTwo) {
          expect(assetTwo).to.equal('asset-two');
          sinon.assert.notCalled(loader.loadScript);

          done();
        });
      });
    });
  });

  mocha.run();
});
