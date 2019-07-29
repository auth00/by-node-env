import program from 'commander';

import { getPackageJson } from './package-json';

export const getProgram = ({ argv }: { argv: string[] }) => {
  program
    .allowUnknownOption()
    .option('-e, --env-file <path>', 'specify path to .env file')
    .option(
      '-p, --package-manager <pm>',
      'specify package manager to run script',
    );

  const packageJson = getPackageJson({ cwd: __dirname });

  if (packageJson) {
    if (packageJson.description) {
      program.description(packageJson.description);
    }

    program.version(packageJson.version);
  }

  program.parse(argv);

  return program;
};
