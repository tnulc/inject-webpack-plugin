var path = require('path');
var pkg = require(path.resolve(__dirname, process.cwd(), 'package.json'));

function buildModuleMapping(options, compiler) {
  var moduleMapping = {};

  var nodeModules = Object.keys(
    Object.assign({}, pkg.dependencies, pkg.devDependencies)
  );

  Object.keys(options).map(function(moduleToBeReplaced) {
    var oldPath = nodeModules.indexOf(moduleToBeReplaced) >= 0
      ? moduleToBeReplaced
      : path.resolve(compiler.context, moduleToBeReplaced);
    var newPath = path.resolve(compiler.context, options[moduleToBeReplaced]);

    moduleMapping[oldPath] = newPath;
  });

  return moduleMapping;
}

function shouldModuleBeReplaced(filesToBeReplaced, path) {
  return filesToBeReplaced.indexOf(path) >= 0;
}

function InjectWebpackPlugin(options) {
  this.options = options;
}

InjectWebpackPlugin.prototype.apply = function(compiler) {
  var moduleMapping = buildModuleMapping(this.options, compiler);
  var filesToBeReplaced = Object.keys(moduleMapping);

  compiler.plugin('normal-module-factory', function(nmf) {
    nmf.plugin('before-resolve', function(module, callback) {
      if (module.context.includes(compiler.context)) {
        var isNonNodeModuleToBeReplaced = shouldModuleBeReplaced(filesToBeReplaced, path.resolve(module.context, module.request));
        var isNodeModuleToBeReplaced = shouldModuleBeReplaced(filesToBeReplaced, module.request);

        if (isNonNodeModuleToBeReplaced || isNodeModuleToBeReplaced) {
          var moduleToBeReplaced = isNonNodeModuleToBeReplaced
            ? path.resolve(module.context, module.request)
            : module.request;

          module.request = moduleMapping[moduleToBeReplaced];
        }
      }

      return callback(null, module);
    });
  });
};

module.exports = InjectWebpackPlugin;
