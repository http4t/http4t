import {spawn} from "child_process";

/**
 * Spawns a process
 * pipes stderr/stdout
 * Resolves or rejects promise on completion
 */
export function spawnPromise(command: string, args: string[], cwd: string=".") {
    console.log(`${command} ${args.join(" ")}`);
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
