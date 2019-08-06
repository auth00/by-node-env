import hashbang from 'rollup-plugin-hashbang';
import typescript from 'rollup-plugin-typescript2';

export default [
  {
    external: [
      'fs',
      'path',
      'dotenv',
      'execa',
      'preferred-pm',
      'read-pkg-up',
      'which-pm-runs',
    ],
    input: 'src/index.ts',
    output: [
      { file: 'dist/index.cjs', format: 'cjs', sourcemap: true },
      { file: 'dist/index.mjs', format: 'esm', sourcemap: true },
    ],
    plugins: [typescript({ tsconfig: 'tsconfig.build.json' })],
  },
  {
    external: [
      'fs',
      'path',
      'url',
      'commander',
      'commander-remaining-args',
      'dotenv',
      'execa',
      'preferred-pm',
      'read-pkg-up',
      'which-pm-runs',
    ],
    input: 'src/cli.ts',
    output: { file: 'dist/cli.cjs', format: 'cjs', sourcemap: true },
    plugins: [hashbang(), typescript({ tsconfig: 'tsconfig.build.json' })],
  },
];
