import {PostgresTransactionPool} from "./utils/transactions/TransactionPool";
import {Logger} from "./utils/Logger";
import {JwtStrategy} from "@http4t/bidi-jwt";
import {InMemoryCredentialRepository} from "./auth/impl/InMemoryCredentialRepository";
import {PostgresDocRepository} from "./docstore/impl/PostgresDocRepository";
import {intersection} from "./utils/intersection";
import {healthLogic} from "./health/logic";
import {authLogic} from "./auth/logic";
import {docStoreLogic} from "./docstore/logic";
import {wrapTransactions} from "./utils/transactions/wrapTransactions";
import {Health} from "@http4t/bidi-eg-client/health";
import {Auth, DocStoreClaims} from "@http4t/bidi-eg-client/auth";
import {SecuredApi} from "@http4t/bidi/auth/withSecurity";
import {DocStore} from "@http4t/bidi-eg-client/docstore";
import {Closeable} from "@http4t/core/server";
import {DockerPgTransactionPool} from "./utils/transactions/DockerPgTransactionPool";
import {migrate} from "./migrations";
import pg from "pg";
import {DocStoreConfig} from "./config";

const {Pool} = pg;

export type FullApi = Health & Auth & SecuredApi<DocStore, DocStoreClaims>;

export type ApiBuilderOpts = {
    logger: Logger,
    jwt: JwtStrategy
};

export type CloseableApiBuilder = ((opts: ApiBuilderOpts) => Promise<FullApi>) & Closeable;

async function migratedTransactionPool(config: DocStoreConfig) {
    const pgTransactionPool = new PostgresTransactionPool(new Pool(config.dataStore.config));

    const transactionPool = config.dataStore.type === "docker-postgres"
        ? new DockerPgTransactionPool(pgTransactionPool)
        : pgTransactionPool;

    await migrate(transactionPool);
    return transactionPool;
}

export async function apiBuilder(config: DocStoreConfig)
    : Promise<CloseableApiBuilder> {

    const transactionPool = await migratedTransactionPool(config);

    const creds = new InMemoryCredentialRepository();

    const builder = async (perRequestOpts: ApiBuilderOpts) => {
        const transaction = await transactionPool.getTransaction();

        const deps = {
            creds,
            store: new PostgresDocRepository(transaction),
            logger: perRequestOpts.logger,
            jwt: perRequestOpts.jwt
        };
        const api = intersection(
            healthLogic(deps),
            authLogic(deps),
            docStoreLogic(deps));

        return wrapTransactions(api, transaction)
    };
    builder.close = async () => transactionPool.stop();
    return builder;
}