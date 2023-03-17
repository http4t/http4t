import {NodeServer} from "@http4t/node/server";
import {startRouter} from "./docStoreRouter";

function expectEnv(k: string): string {
    const result = process.env[k];
    if (typeof result === "undefined") throw new Error(`ENV ${k} was not set`);
    return result;
}

(async function main() {
    const router = await startRouter({
        auth: {
            type: "secure",
            publicKey: expectEnv('docstore.datastore.public_key'),
            privateKey: expectEnv('docstore.datastore.private_key')
        },
        containsPii: (process.env['docstore.containspii'] || "true").toLowerCase() !== 'false',
        dataStore: {
            type: "postgres", config: {
                database: expectEnv('docstore.datastore.database'),
                user: expectEnv('docstore.datastore.user'),
                password: expectEnv('docstore.datastore.password')
            }
        }
    });
    const server = await NodeServer.start(router);
    console.log('Running on port', (await server.url()).authority);
})();
