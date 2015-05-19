/* global describe, it */
'use strict';

var assert = require('assert');
var fs = require('fs-extra');
var path = require('path');

var generate = require('../../generator');

var dependencies = {
  app1 : [
    'asset-without-dependency@1.0.0'
  ],
  app2 : [
    'asset-with-dependency@1.0.0',
    'asset-without-dependency@1.0.0'
  ]
};

var assetDir = path.resolve(__dirname, '../fixtures/assets');

function makeTargetDir () {
  var tmp = new Date().getTime() + Math.random() + '';
  var dir = path.resolve(__dirname, '../scratch', tmp);
  fs.ensureDirSync(dir);
  return dir;
}

describe('generator', function () {
  describe('configuration', function () {
    it('requires a dependencies object', function () {
      assert.throws(function () {
        generate({
          namespace : 'TEST',
          sourceDir : 'doesntmatter',
          targetDir : 'doesntmatter'
        });
      });
    });

    it('requires a sourceDir', function () {
      assert.throws(function () {
        generate({
          namespace : 'TEST',
          targetDir : 'doesntmatter',
          dependencies : {}
        });
      });
    });

    it('requires a targetDir', function () {
      assert.throws(function () {
        generate({
          namespace : 'TEST',
          sourceDir : 'doesntmatter',
          dependencies : {}
        });
      });
    });

    it('requires a namespace', function () {
      assert.throws(function () {
        generate({
          sourceDir : 'doesntmatter',
          targetDir : 'doesntmatter',
          dependencies : {}
        });
      });
    });
  });

  describe('filesystem preparation', function () {
    it('ensures an empty destination directory', function () {
      var dir = makeTargetDir();
      fs.writeFileSync(path.resolve(dir, 'tmp.txt'), 'temp');

      generate({
        dependencies : dependencies,
        sourceDir : 'doesntmatter',
        targetDir : dir,
        namespace : 'TEMP'
      });

      assert(fs.existsSync(dir));
      assert(!fs.existsSync(path.resolve(dir, 'tmp.txt')));
    });
  });

  describe('asset files', function () {
    it('creates the required files', function (done) {
      var dir = makeTargetDir();

      generate({
        dependencies : dependencies,
        sourceDir : assetDir,
        targetDir : dir,
        namespace : 'NAMESPACE'
      }).then(function () {
        assert(fs.existsSync(
          path.resolve(dir, 'asset-without-dependency@1.0.0.js')
        ));

        assert(fs.existsSync(
          path.resolve(dir, 'asset-with-dependency@1.0.0.js')
        ));

        assert(fs.existsSync(
          path.resolve(dir,
            'asset-with-dependency@1.0.0+asset-without-dependency@1.0.0.js')
        ));

        done();
      }, function (err) {
        done(err);
      });
    });
  });
});
