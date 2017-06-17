var path = require('path');
var fs = require('fs');
var webpack = require('webpack');
var rimraf = require('rimraf');
var assert = require('chai').assert;

var InjectWebpackPlugin = require('../index');

var OUTPUT_DIR = path.join(__dirname, '../dist');

suite('InjectWebpackPlugin', function() {
  beforeEach(function(done) {
    rimraf(OUTPUT_DIR, done);
  });

  test('swaps dependencies correctly', function(done) {
    webpack(
      {
        entry: path.join(__dirname, 'fixtures/index.js'),
        output: {
          path: OUTPUT_DIR,
          filename: 'bundle.js'
        },
        plugins: [
          new InjectWebpackPlugin({
            './test/fixtures/a': './test/fixtures/b',
            rimraf: './test/fixtures/c'
          })
        ]
      },
      function(err, stats) {
        var fileContent = fs.readFileSync(
          path.resolve(OUTPUT_DIR, 'bundle.js'),
          'utf8'
        );
        assert.include(fileContent, '/*! FILE B */', 'file contains module b.');
        assert.include(fileContent, '/*! FILE C */', 'file contains module c.');
        done();
      }
    );
  });
});
