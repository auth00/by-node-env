(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('fs'), require('path'), require('dotenv'), require('execa'), require('preferred-pm'), require('read-pkg-up'), require('which-pm-runs')) :
  typeof define === 'function' && define.amd ? define(['fs', 'path', 'dotenv', 'execa', 'preferred-pm', 'read-pkg-up', 'which-pm-runs'], factory) :
  (global = global || self, global.byNodeEnv = factory(global.fs, global.path, global.dotenv, global.execa, global.preferredPM, global.readPkgUp, global.whichPMRuns));
}(this, function (fs, path, dotenv, execa, preferredPM, readPkgUp, whichPMRuns) { 'use strict';

  fs = fs && fs.hasOwnProperty('default') ? fs['default'] : fs;
  path = path && path.hasOwnProperty('default') ? path['default'] : path;
  dotenv = dotenv && dotenv.hasOwnProperty('default') ? dotenv['default'] : dotenv;
  execa = execa && execa.hasOwnProperty('default') ? execa['default'] : execa;
  preferredPM = preferredPM && preferredPM.hasOwnProperty('default') ? preferredPM['default'] : preferredPM;
  readPkgUp = readPkgUp && readPkgUp.hasOwnProperty('default') ? readPkgUp['default'] : readPkgUp;
  whichPMRuns = whichPMRuns && whichPMRuns.hasOwnProperty('default') ? whichPMRuns['default'] : whichPMRuns;

  function _extends() {
    _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    return _extends.apply(this, arguments);
  }

  function _objectWithoutPropertiesLoose(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;

    for (i = 0; i < sourceKeys.length; i++) {
      key = sourceKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      target[key] = source[key];
    }

    return target;
  }

  const getNodeEnv = ({
    cwd,
    env,
    envFile
  }) => {
    if (env.NODE_ENV) {
      return env.NODE_ENV;
    }

    if (envFile) {
      const envPath = path.isAbsolute(envFile) ? path.resolve(envFile) : path.resolve(cwd, envFile);
      const envBuffer = fs.readFileSync(envPath);
      const envConfig = dotenv.parse(envBuffer);

      if (envConfig.NODE_ENV) {
        return envConfig.NODE_ENV;
      }
    }

    return 'development';
  };

  const getPackageManager = function ({
    cwd,
    env,
    packageManager
  }) {
    try {
      function _temp(pm) {
        if (pm) {
          return pm.name;
        }

        const readResult = readPkgUp.sync({
          cwd
        });

        if (readResult) {
          const packageJson = readResult.package;

          if (packageJson.engines) {
            const _packageJson$engines = packageJson.engines,
                  engines = _objectWithoutPropertiesLoose(_packageJson$engines, ["node"]);

            const packageManagers = Object.keys(engines).filter(engine => engine);

            if (packageManagers[0]) {
              return packageManagers[0];
            }
          }
        }

        return 'npm';
      }

      if (packageManager) {
        return Promise.resolve(packageManager);
      }

      if (env.npm_execpath) {
        return Promise.resolve(env.npm_execpath);
      }

      const _whichPMRuns = whichPMRuns();

      return Promise.resolve(_whichPMRuns ? _temp(_whichPMRuns) : Promise.resolve(preferredPM(cwd)).then(_temp));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  const spawn = ({
    cwd,
    env,
    nodeEnv,
    packageManager,
    remainingArgv,
    runScript
  }) => {
    const command = packageManager;
    const args = ['run', `${runScript}:${nodeEnv}`, ...remainingArgv];
    const options = {
      cwd,
      env: _extends({}, env, {
        NODE_ENV: nodeEnv
      }),
      stdio: 'inherit'
    };
    return execa(command, args, options);
  };

  const byNodeEnv = function ({
    cwd = process.cwd(),
    env = process.env,
    envFile,
    packageManager,
    remainingArgv = [],
    runScript = 'start'
  } = {}) {
    try {
      const _getNodeEnv = getNodeEnv({
        cwd,
        env,
        envFile
      });

      return Promise.resolve(getPackageManager({
        cwd,
        env,
        packageManager
      })).then(function (_getPackageManager) {
        return spawn({
          cwd,
          env,
          nodeEnv: _getNodeEnv,
          packageManager: _getPackageManager,
          remainingArgv,
          runScript
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  return byNodeEnv;

}));
//# sourceMappingURL=index.umd.js.map
