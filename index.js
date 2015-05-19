var path = require('path');
var generate = require('./lib/generate');

var dependencies = {
  firebird : [
    'jquery-bv@1.11.1',
    'backbone-bv@1.0.0',
    'lodash-bv@1.2.0'
  ],
  curations : [
    'jquery-bv@1.11.1',
    'underscore@1.5.2'
  ],
  spotlights : [
    'backbone-bv@1.2.0',
    'lodash@2.4.1'
  ]
};

module.exports = {
  generate : generate
};

generate({
  dependencies : dependencies,
  sourceDir : path.resolve(__dirname, 'assets'),
  targetDir : path.resolve(__dirname, 'dist'),
  namespace : 'BV'
});
