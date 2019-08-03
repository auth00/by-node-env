/// <reference types="node" />
import execa from 'execa';
declare const byNodeEnv: ({ cwd, env, envFile, packageManager, remainingArgv, runScript, }?: {
    cwd?: string | undefined;
    env?: NodeJS.ProcessEnv | undefined;
    envFile?: string | undefined;
    packageManager?: string | undefined;
    remainingArgv?: string[] | undefined;
    runScript?: string | undefined;
}) => Promise<execa.ExecaReturnValue<string>>;
export default byNodeEnv;
//# sourceMappingURL=index.d.ts.map