import fs from 'fs';
import path from 'path';

import dotenv from 'dotenv';
import execa from 'execa';
import preferredPM from 'preferred-pm';
import readPkgUp from 'read-pkg-up';
import whichPMRuns from 'which-pm-runs';

const getNodeEnv = ({
  cwd,
  env,
  envFile,
}: {
  cwd: string;
  env: NodeJS.ProcessEnv;
  envFile?: string;
}) => {
  if (env.NODE_ENV) {
    return env.NODE_ENV;
  }

  if (envFile) {
    const envPath = path.isAbsolute(envFile)
      ? path.resolve(envFile)
      : path.resolve(cwd, envFile);
    const envBuffer = fs.readFileSync(envPath);
    const envConfig = dotenv.parse(envBuffer);
    if (envConfig.NODE_ENV) {
      return envConfig.NODE_ENV;
    }
  }

  return 'development';
};

const getPackageManager = async ({
  cwd,
  env,
  packageManager,
}: {
  cwd: string;
  env: NodeJS.ProcessEnv;
  packageManager?: string;
}) => {
  if (packageManager) {
    return packageManager;
  }

  if (env.npm_execpath) {
    return env.npm_execpath;
  }

  const pm = whichPMRuns() || (await preferredPM(cwd));
  if (pm) {
    return pm.name;
  }

  const readResult = readPkgUp.sync({ cwd });
  if (readResult) {
    const packageJson = readResult.package;
    if (packageJson.engines) {
      const { node, ...engines } = packageJson.engines;
      const packageManagers = Object.keys(engines).filter((engine) => engine);
      if (packageManagers[0]) {
        return packageManagers[0];
      }
    }
  }

  return 'npm';
};

const spawn = ({
  cwd,
  env,
  nodeEnv,
  packageManager,
  remainingArgv,
  runScript,
}: {
  cwd: string;
  env: NodeJS.ProcessEnv;
  nodeEnv: string;
  packageManager: string;
  remainingArgv: string[];
  runScript: string;
}) => {
  const command = packageManager;
  const args = ['run', `${runScript}:${nodeEnv}`, ...remainingArgv];
  const options: execa.SyncOptions = {
    cwd,
    env: { ...env, NODE_ENV: nodeEnv },
    stdio: 'inherit',
  };

  return execa(command, args, options);
};

const byNodeEnv = async ({
  cwd = process.cwd(),
  env = process.env,
  envFile,
  packageManager,
  remainingArgv = [],
  runScript = 'start',
}: {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  envFile?: string;
  packageManager?: string;
  remainingArgv?: string[];
  runScript?: string;
} = {}) =>
  spawn({
    cwd,
    env,
    nodeEnv: getNodeEnv({ cwd, env, envFile }),
    packageManager: await getPackageManager({ cwd, env, packageManager }),
    remainingArgv,
    runScript,
  });

export default byNodeEnv;
