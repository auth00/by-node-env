#!/usr/bin/env node

import path from 'path';
import url from 'url';

import program from 'commander';
import getRemainingArgs from 'commander-remaining-args';
import execa from 'execa';
import readPkgUp from 'read-pkg-up';

import byNodeEnv from '.';

const filename = url.fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const readResult = readPkgUp.sync({ cwd: dirname });
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
const runScript = process.env.npm_lifecycle_event;

byNodeEnv({ envFile, packageManager, remainingArgv, runScript })
  .then((childProcessResult) => {
    process.exitCode = childProcessResult.exitCode;
  })
  .catch((childProcessResult: execa.ExecaError) => {
    process.exitCode = childProcessResult.exitCode;
  });
