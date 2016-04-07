/**
 * @fileOverview Grunt configuration.
 */

// Core.
var path = require('path');

// Local.
var generator = require('./lib/generate');

module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-webpack');

  grunt.initConfig({
    webpack: {
      test: {
        entry: './test/integration/main.js',
        output: {
          path: './test/scratch/',
          filename: 'main.js'
        }
      }
    },

    copy: {
      test: {
        files: [
          {
            expand: true,
            cwd: 'test/integration/',
            src: 'index.html',
            dest: 'test/scratch/'
          },
          {
            expand: true,
            cwd: 'node_modules',
            src: 'mocha/mocha.*',
            dest: 'test/scratch/'
          },
          {
            expand: true,
            cwd: 'node_modules',
            src: 'chai/chai.js',
            dest: 'test/scratch/'
          },
          {
            expand: true,
            cwd: 'node_modules',
            src: 'sinon/pkg/sinon.js',
            dest: 'test/scratch/'
          }
        ]
      }
    },

    clean: {
      test: ['test/scratch']
    },

    eslint: {
      target: [
        'lib/**/*.js',
        'test/**/*.js',
        '!test/scratch/**/*',
        '!test/fixtures/assets/**/*'
      ]
    },

    generate: {
      test: {
        sourceDir: path.resolve(__dirname, 'test/fixtures/assets'),
        targetDir: path.resolve(__dirname, 'test/scratch/assets'),
        assetBundles: {
          app: [
            'asset-one@1.0.0',
            'asset-two@1.0.0'
          ]
        },
        namespaceName: 'TEST',
        uglify: true
      }
    },

    connect: {
      serve: {
        options: {
          port: 9999,
          base: 'test/scratch',
          open: 'http://localhost:9999/index.html',
          livereload: true
        }
      },
      test: {
        options: {
          port: 9999,
          base: 'test/scratch'
        }
      }
    },

    watch: {
      test: {
        files: [
          'lib/**/*.js',
          'assets/**/*.js',
          'test/**/*'
        ],
        tasks: ['webpack:test'],
        options: {
          livereload: true
        }
      }
    },

    // PhantomJS tests.
    mocha: {
      all: {
        options: {
          urls: [
            'http://localhost:9999/index.html'
          ]
        }
      }
    },

    // Server-side tests of generator
    mochaTest: {
      options: {
        reporter: 'spec',
        quiet: false,
        clearRequireCache: false,
        require: [
          path.join(__dirname, 'test/unit/mochaInit.js')
        ]
      },
      test: {
        src: ['test/unit/**/*.spec.js']
      }
    }
  });

  grunt.registerMultiTask('generate', function () {
    var done = this.async();

    generator(this.data, done);
  });

  grunt.registerTask('serve', [
    'clean:test',
    'webpack:test',
    'generate:test',
    'copy:test',
    'connect:serve',
    'watch:test'
  ]);

  grunt.registerTask('test', [
    'eslint',
    'clean:test',
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
};
