import {HttpHandler} from "@http4t/core/contract";
import {filterRequest, withFilters} from "@http4t/core/Filter";
import {Closeable} from "@http4t/core/server";
import {ClientHandler} from "@http4t/node/client";
import {NodeServer} from "@http4t/node/server";
import {isFailure} from "@http4t/result";
import {PoolConfig} from 'pg';
import {authClient} from "@http4t/bidi-eg-client/auth";
import {DocStore, docStoreClient} from "@http4t/bidi-eg-client/docstore";
import {startRouter} from "@http4t/bidi-eg-server/docStoreRouter";
import {DocStoreConfig} from "@http4t/bidi-eg-server/config";

export type CloseableHttpHandler = HttpHandler & Closeable;

export const testDatabase: PoolConfig = {
    database: "bidi-example",
    user: "bidi-example",
    password: "password",
};
export const TEST_CONFIG: DocStoreConfig = {
    auth: {
        type: "insecure",
        expectedSignature: "somesignature"
    },
    containsPii: false,
    dataStore: {type: "docker-postgres", config: testDatabase}
};

export async function startTestServer(opts: DocStoreConfig = TEST_CONFIG): Promise<CloseableHttpHandler> {
    const router = await startRouter(opts);

    const server = await NodeServer.start(router);
    const url = await server.url();

    const httpClient: HttpHandler = withFilters(
        ClientHandler.defaultTo('http'),

        filterRequest(r => ({
            ...r,
            uri: {...r.uri, authority: url.authority}
        })));

    return {
        ...httpClient,
        async close(): Promise<void> {
            console.log("Closing TestContext...");
            await server.close();
            console.log("Server closed");
            await router.close();
            console.log("Transaction pool closed");
        }
    };
}

export async function loggedInDocStore(httpClient: HttpHandler, opts: { userName: string }): Promise<DocStore> {
    const auth = authClient(httpClient);

    const creds = {userName: opts.userName, password: "password"};

    console.log(`Registering ${JSON.stringify(creds)}`)
    await auth.register(creds)

    console.log(`Logging in as ${JSON.stringify(creds)}`)
    const jwt = await auth.login(creds);
    if (isFailure(jwt)) throw new Error(jwt.error);

    return docStoreClient(httpClient, jwt.value);
}