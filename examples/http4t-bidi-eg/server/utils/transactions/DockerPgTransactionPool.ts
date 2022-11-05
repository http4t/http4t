import {Transaction, TransactionPool} from "@http4t/bidi-eg-server/utils/transactions/TransactionPool";
import {promisify} from "util";
import {exec} from "child_process";

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const execPromise = promisify(exec);

export function timeout<T>(f: ((() => T) | (() => Promise<T>)), timeout?: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        setTimeout(async () => {
            try {
                resolve(await f());
            } catch (e: any) {
                reject(e);
            }
        }, timeout);
    })
}

export function sleep(ms?: number): Promise<void> {
    return timeout(() => undefined, ms);
}

/**
 * too tired to do this non-disgustingly
 */
async function retry<T>(f: () => Promise<T>, count: number, sleepMs: number = 20): Promise<T> {
    let error;
    if (count < 1) throw new Error(`Count must be >= 1 but was ${count}`);
    let attempt = 0;
    while (attempt++ <= count) {
        if (error)
            await sleep(sleepMs)
        try {
            return await f();
        } catch (e: any) {
            error = e;
        }
    }
    throw error;
}

/**
 * Keep forgetting to start the postgres docker image before running tests.
 *
 * This calls ./startPostgres automatically
 */
export class DockerPgTransactionPool implements TransactionPool {
    constructor(private readonly decorated: TransactionPool) {

    }

    async getTransaction(): Promise<Transaction> {
        try {
            return await this.decorated.getTransaction();
        } catch (e: any) {
            if (e.code !== "ECONNREFUSED") {
                throw e;
            }
            console.log(`RUNNING ${__dirname}/startPostgres`);
            await execPromise(`${__dirname}/startPostgres`);
            return retry(() => this.decorated.getTransaction(), 50, 100)
        }
    }

    stop(): Promise<void> {
        return Promise.resolve(undefined);
    }
}
