var path = require('path');
var root = path.resolve(__dirname, process.cwd());

function InjectWebpackPlugin(options) {
  this.options = options;
  this.nodeModules = Object.keys(require(root + '/package.json').dependencies);
}

InjectWebpackPlugin.prototype.apply = function(compiler) {
  var _this = this;

  this.dependencyMapings = {};

  Object.keys(this.options).map(function (key) {
    var paths = _this.options[key].split('/');
    var newFileName = paths.pop();

    var entry = _this.nodeModules.indexOf(key) !== -1 ?
      key :
      path.resolve(compiler.context, key);

    var newContext = paths.join('/');

    return _this.dependencyMapings[entry] = {
      context: path.resolve(root, compiler.context, newContext),
      fileName: newFileName
    }
  });

  compiler.plugin('normal-module-factory', function (nmf) {
    nmf.plugin('before-resolve', function(module, callback) {
      if (_this.dependencyMapings[module.request]) {
        var newDependency = _this.dependencyMapings[module.request];
        var newPath = path.join(newDependency.context, newDependency.fileName);
        module.request = newPath;
        module.dependency.request = newPath;
        module.dependency.userRequest = newPath;
      }
      return callback(null, module);
    });

    nmf.plugin('after-resolve', function (module, callback) {
      if (_this.dependencyMapings[module.resource]) {
        var newDependency = _this.dependencyMapings[module.resource];
        var newPath = path.join(newDependency.context, newDependency.fileName);

        module.request = module.request.replace(module.resource, newPath);
        module.context = newDependency.context;
        module.rawRequest = newPath;
        module.userRequest = newPath;
        module.resource = newPath;
      }
      return callback(null, module);
    });
  });
};

module.exports = InjectWebpackPlugin;
