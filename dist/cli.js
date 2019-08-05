#!/usr/bin/env node
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var path = _interopDefault(require('path'));
var url = _interopDefault(require('url'));
var program = _interopDefault(require('commander'));
var getRemainingArgs = _interopDefault(require('commander-remaining-args'));
var readPkgUp = _interopDefault(require('read-pkg-up'));
var fs = require('fs');
var dotenv = _interopDefault(require('dotenv'));
var execa = _interopDefault(require('execa'));
var preferredPM = _interopDefault(require('preferred-pm'));
var whichPMRuns = _interopDefault(require('which-pm-runs'));

const getNodeEnv = async ({ cwd, env, envFile, }) => {
    if (env.NODE_ENV) {
        return env.NODE_ENV;
    }
    if (envFile) {
        const envPath = path.isAbsolute(envFile)
            ? path.resolve(envFile)
            : path.resolve(cwd, envFile);
        const envBuffer = await fs.promises.readFile(envPath);
        const envConfig = dotenv.parse(envBuffer);
        if (envConfig.NODE_ENV) {
            return envConfig.NODE_ENV;
        }
    }
    return 'development';
};
const getPackageManager = async ({ cwd, env, packageManager, }) => {
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
            const packageManagers = Object.keys(engines).filter((engine) => engine);
            if (packageManagers[0]) {
                return packageManagers[0];
            }
        }
    }
    return 'npm';
};
const byNodeEnv = async ({ cwd = process.cwd(), env = process.env, envFile, packageManager, remainingArgv = [], runScript = env.npm_lifecycle_event || 'start', } = {}) => {
    const NODE_ENV = await getNodeEnv({ cwd, env, envFile });
    const command = await getPackageManager({ cwd, env, packageManager });
    const args = ['run', `${runScript}:${NODE_ENV}`, ...remainingArgv];
    const options = {
        cwd,
        env: { ...env, NODE_ENV },
        stdio: 'inherit',
    };
    const childProcessResult = await execa(command, args, options).catch((childProcessResult) => {
        process.exitCode = childProcessResult.exitCode;
        throw childProcessResult;
    });
    process.exitCode = childProcessResult.exitCode;
    return childProcessResult;
};

const cli = async () => {
    const filename = url.fileURLToPath((typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : (document.currentScript && document.currentScript.src || new URL('cli.js', document.baseURI).href)));
    const dirname = path.dirname(filename);
    const readResult = await readPkgUp({ cwd: dirname });
    if (readResult) {
        const packageJson = readResult.package;
        if (packageJson.description) {
            program.description(packageJson.description);
        }
        program.version(packageJson.version);
    }
    program
        .allowUnknownOption()
        .option('-e, --env-file <path>', 'specify path to .env file')
        .option('-p, --package-manager <pm>', 'specify package manager to run-script')
        .parse(process.argv);
    const { envFile, packageManager } = program;
    const remainingArgv = getRemainingArgs(program);
    byNodeEnv({ envFile, packageManager, remainingArgv });
};
cli();
//# sourceMappingURL=cli.js.map
