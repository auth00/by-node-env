import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import execa from 'execa';
import preferredPM from 'preferred-pm';
import readPkgUp from 'read-pkg-up';
import whichPMRuns from 'which-pm-runs';

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

export default byNodeEnv;
//# sourceMappingURL=index.modern.mjs.map
