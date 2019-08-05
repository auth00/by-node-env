import 'commander';

declare module 'commander' {
  interface CommanderStatic {
    envFile?: string;
    packageManager?: string;
  }
}
