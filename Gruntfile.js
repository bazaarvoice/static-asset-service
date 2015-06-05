'use strict';

var path = require('path');

var semver = require('semver');

var dependencies = {
  firebird : [
    'jquery-bv@1.11.1',
    'backbone-bv@1.0.0',
    'lodash-bv@1.2.0'
  ],
  curations : [
    'jquery-bv@1.11.1',
    'underscore-bv@1.5.2'
  ]
};

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  var pkg = grunt.file.readJSON('package.json');
  var version = pkg.version;

  // Deploy all map and JS files to an s3 bucket in:
  // - common/static/$major/
  // - common/static/$major.$minor/
  // - common/static/$major.$minor.$patch/
  var s3Files = [{
    cwd : 'dist',
    src : [
      '**/*.js',
      '**/*.map'
    ],
    dest : 'common/static-assets/' +
      semver.major(version) + '/'
  },
  {
    cwd : 'dist',
    src : [
      '**/*.js',
      '**/*.map'
    ],
    dest : 'common/static-assets/' +
      semver.major(version) + '.' +
      semver.minor(version) + '/'
  },
  {
    cwd : 'dist',
    src : [
      '**/*.js',
      '**/*.map'
    ],
    dest : 'common/static-assets/' +
      semver.major(version) + '.' +
      semver.minor(version) + '.' +
      semver.patch(version) + '/'
  }];

  grunt.initConfig({
    pkg : pkg,

    webpack : {
      test : {
        entry : './test/integration/main.js',
        output : {
          path : './test/scratch/',
          filename : 'main.js'
        }
      }
    },

    uglify : {
      options : {
        sourceMap : true
      },
      dist : {
        files : [{
          expand : true,
          cwd : 'dist',
          src : '**/*.js',
          dest : 'dist'
        }]
      }
    },

    copy : {
      test : {
        files : [
          {
            expand : true,
            cwd : 'test/integration/',
            src : 'index.html',
            dest : 'test/scratch/'
          },
          {
            expand : true,
            cwd : 'node_modules',
            src : 'mocha/mocha.*',
            dest : 'test/scratch/'
          },
          {
            expand : true,
            cwd : 'node_modules',
            src : 'chai/chai.js',
            dest : 'test/scratch/'
          }
        ]
      }
    },

    clean : {
      dist : [
        'dist'
      ],
      test : ['test/scratch']
    },

    eslint : {
      target : [
        'lib/**/*.js',
        'sdk/**/*.js',
        'test/**/*.js',
        '!test/scratch/**/*',
        '!test/fixtures/assets/**/*'
      ]
    },

    generate : {
      dist : {
        src : path.resolve(__dirname, 'assets'),
        dest : path.resolve(__dirname, 'dist'),
        deps : dependencies,
        namespace : 'BV'
      },
      test : {
        src : path.resolve(__dirname, 'test/fixtures/assets'),
        dest : path.resolve(__dirname, 'test/scratch/assets'),
        deps : {
          app : [
            'asset-with-dependency@1.0.0',
            'asset-without-dependency@1.0.0'
          ]
        },
        namespace : 'TEST'
      }
    },

    connect : {
      serve : {
        options : {
          port : 9999,
          base : 'test/scratch',
          open : 'http://localhost:9999/index.html',
          livereload : true
        }
      },
      test : {
        options : {
          port : 9999,
          base : 'test/scratch'
        }
      }
    },

    watch : {
      test : {
        files : [
          'lib/**/*.js',
          'assets/**/*.js',
          'sdk/**/*.js',
          'test/**/*'
        ],
        tasks : ['webpack:test'],
        options : {
          livereload : true
        }
      }
    },

    // PhantomJS tests of SDK
    mocha : {
      all : {
        options : {
          urls : [
            'http://localhost:9999/index.html'
          ]
        }
      }
    },

    // Server-side tests of generator
    mochaTest : {
      test : {
        src : ['test/unit/**/*.js']
      }
    },

    s3 : {
      options : {
        bucket : 'origin-bvfirebird-display-test',
        headers : {
          CacheControl : 'max-age=2592000'
        }
      },
      test : {
        files : s3Files,
        options : {
          bucket : 'origin-bvfirebird-display-test'
        }
      },
      qa : {
        files : s3Files,
        options : {
          bucket : 'origin-bvfirebird-display-qa'
        }
      },
      prod : {
        files : s3Files,
        options : {
          bucket : 'origin-bvfirebird-display-prod'
        }
      }
    }
  });

  grunt.registerMultiTask('generate', function () {
    var generate = require('./generator');
    var done = this.async();

    generate({
      dependencies : this.data.deps,
      sourceDir : this.data.src,
      targetDir : this.data.dest,
      namespace : this.data.namespace
    }).then(function () {
      done();
    }, function (err) {
      grunt.log.error(err);
      done(false);
    });
  });

  grunt.registerTask('dist', [
    'clean:dist',
    'generate:dist',
    'uglify:dist'
  ]);

  grunt.registerTask('serve', [
    'webpack:test',
    'generate:test',
    'copy:test',
    'connect:serve',
    'watch:test'
  ]);

  grunt.registerTask('test', [
    'eslint',
    'webpack:test',
    'generate:test',
    'copy:test',
    'connect:test',
    'mocha',
    'mochaTest'
  ]);

  grunt.registerTask('pre-push', [
    'test'
  ]);

  grunt.registerTask('deploy', 'Deploy the assets', function (env) {
    if (!env) {
      return grunt.task.run([
        'dist',
        's3'
      ]);
    }

    if (['prod', 'qa', 'test'].indexOf(env) === -1) {
      return grunt.fail.fatal('The environment "' +
        env +
        '" is not valid. ' +
        'Valid environments are prod, test, and qa.');
    }

    grunt.task.run([
      'dist',
      's3:' + env
    ]);
  });
};
