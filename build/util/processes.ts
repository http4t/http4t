import {spawn} from "child_process";

/**
 * Spawns a process
 * pipes stderr/stdout
 * Resolves or rejects promise on completion
 */
export function spawnPromise(command: string, args: string[], cwd: string=".") {
    console.log(`\x1b[32m${cwd} \x1b[34m${command} ${args.join(" ")}\x1b[0m`);
    const test = spawn(command, args, {cwd});
    test.stderr.pipe(process.stderr);
    test.stdout.pipe(process.stdout);
    return new Promise((resolve, reject) => {
        test.on("exit", (code: number | null) => {
            if (code == 0) {
                resolve(code);
            } else {
                reject(code);
            }
        })
    });
}
