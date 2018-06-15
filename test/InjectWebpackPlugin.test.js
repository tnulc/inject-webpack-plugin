const path = require('path');
const fs = require('fs');
const webpack = require('webpack');

const InjectWebpackPlugin = require('../index');

const OUTPUT_DIR = path.join(__dirname, '../dist');
const WEBPACK_CONFIG = {
  entry: path.join(__dirname, 'fixtures/index.js'),
  output: {
    path: OUTPUT_DIR,
    filename: 'bundle.js'
  },
  plugins: [
    new InjectWebpackPlugin({
      './test/fixtures/a': './test/fixtures/b',
      jest: './test/fixtures/c'
    })
  ]
};

const deleteFolderRecursively = path => {
  if (!fs.existsSync(path)) {
    return;
  }

  fs.readdirSync(path).forEach((file, index) => {
    const curPath = path + '/' + file;
    if (fs.lstatSync(curPath).isDirectory()) {
      deleteFolderRecursively(curPath);
    } else {
      fs.unlinkSync(curPath);
    }
  });

  fs.rmdirSync(path);
};

describe('InjectWebpackPlugin', () => {
  it('swaps dependencies correctly', () => {
    const compiler = webpack(WEBPACK_CONFIG);

    compiler.hooks.done.tap('InjectWebpackPluginTest', () => {
      const fileContent = fs.readFileSync(
        path.resolve(OUTPUT_DIR, 'bundle.js'),
        'utf8'
      );

      expect(fileContent).toMatch('/*! FILE B */');
      expect(fileContent).toMatch('/*! FILE C */');
      deleteFolderRecursively(OUTPUT_DIR);
    });
  });
});
