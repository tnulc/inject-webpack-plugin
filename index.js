var path = require('path');
var root = path.resolve(__dirname, process.cwd());
var pkg = require(root + '/package.json');

function InjectWebpackPlugin(options) {
  this.options = options;
  var dependencies = Object.keys(pkg.dependencies);
  var devDependencies = Object.keys(pkg.devDependencies);
  this.nodeModules = dependencies.concat(devDependencies);
}

InjectWebpackPlugin.prototype.apply = function(compiler) {
  var _this = this;
  this.dependencyMap = {};

  this.filesToBeReplaced = Object.keys(this.options).map(function (file) {
    if (_this.nodeModules.indexOf(file) !== -1) {
      _this.dependencyMap[file] = path.resolve(compiler.context, _this.options[file]);
      return file;
    }

    var resolvedPath = path.resolve(compiler.context, file);
    _this.dependencyMap[resolvedPath] = path.resolve(compiler.context, _this.options[file]);
    return resolvedPath;
  });

  compiler.plugin('normal-module-factory', function (nmf) {
    nmf.plugin('before-resolve', function(module, callback) {
      if(module.context.includes(compiler.context)) {
        var nonNodeModuleIndex = _this.filesToBeReplaced.indexOf(path.resolve(compiler.context, module.request));
        var nodeModuleIndex = _this.filesToBeReplaced.indexOf(module.request);

        if(nonNodeModuleIndex !== -1 || nodeModuleIndex !== -1) {
          var newFile = nonNodeModuleIndex !== -1 ? path.resolve(compiler.context, module.request) : module.request;
          module.request = _this.dependencyMap[newFile];
          module.dependency.request = _this.dependencyMap[newFile];
          module.dependency.userRequest = _this.dependencyMap[newFile];
        }
      };

      return callback(null, module);
    });
  });
};

module.exports = InjectWebpackPlugin;
