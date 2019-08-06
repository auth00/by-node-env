import { promises as fsPromises } from 'fs';
import path from 'path';

import dotenv from 'dotenv';
import execa from 'execa';
import preferredPM from 'preferred-pm';
import readPkgUp from 'read-pkg-up';
import whichPMRuns from 'which-pm-runs';

const getNodeEnv = async ({
  cwd,
  env,
  envFile,
}: {
  cwd: string;
  env: NodeJS.ProcessEnv;
  envFile?: string;
}): Promise<string> => {
  if (env.NODE_ENV) {
    return env.NODE_ENV;
  }

  if (envFile) {
    const envPath = path.isAbsolute(envFile)
      ? path.resolve(envFile)
      : path.resolve(cwd, envFile);
    const envBuffer = await fsPromises.readFile(envPath);
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
}): Promise<string> => {
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

  const readResult = await readPkgUp({ cwd });
  if (readResult) {
    const packageJson = readResult.package;
    if (packageJson.engines) {
      const { node, ...engines } = packageJson.engines;
      const packageManagers = Object.keys(engines).filter(
        (engine): string => engine,
      );
      if (packageManagers[0]) {
        return packageManagers[0];
      }
    }
  }

  return 'npm';
};

const byNodeEnv = async ({
  cwd = process.cwd(),
  env = process.env,
  envFile,
  packageManager,
  remainingArgv = [],
  runScript = env.npm_lifecycle_event || 'start',
}: {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  envFile?: string;
  packageManager?: string;
  remainingArgv?: string[];
  runScript?: string;
} = {}): Promise<execa.ExecaReturnValue> => {
  const NODE_ENV = await getNodeEnv({ cwd, env, envFile });

  const command = await getPackageManager({ cwd, env, packageManager });
  const args = ['run', `${runScript}:${NODE_ENV}`, ...remainingArgv];
  const options: execa.Options = {
    cwd,
    env: { ...env, NODE_ENV },
    stdio: 'inherit',
  };

  return execa(command, args, options)
    .then(
      (childProcessResult): execa.ExecaReturnValue => {
        process.exitCode = childProcessResult.exitCode;
        return childProcessResult;
      },
    )
    .catch((childProcessResult: execa.ExecaError): never => {
      process.exitCode = childProcessResult.exitCode;
      throw childProcessResult;
    });
};

export default byNodeEnv;
