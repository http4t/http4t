import {buildRouter, RequestLifecycle} from "@http4t/bidi/router";
import {HttpHandler, HttpRequest, HttpResponse} from "@http4t/core/contract";
import {Closeable} from "@http4t/core/server";
import {handleError} from "./utils/filters/errors";
import {httpInfoLogger} from "./utils/HttpInfoLogger";
import {CumulativeLogger} from "./utils/Logger";
import {migrate} from "./migrations";
import {DocRepository} from "./docstore/impl/DocRepository";
import {PostgresTransactionPool, Transaction} from "./utils/transactions/TransactionPool";
import {withFilters} from "@http4t/core/Filter";
import {routes} from "@http4t/bidi/routes";
import {JwtStrategy} from "@http4t/bidi-jwt";
import {PROD_LIFECYCLE} from "@http4t/bidi/lifecycles/ProductionRequestLifecycle";
import {DebugRequestLifecycle} from "@http4t/bidi/lifecycles/DebugRequestLifecycle";
import {CredStore} from "./auth/impl/CredStore";
import {PostgresStore} from "./docstore/impl/PostgresStore";
import {InMemoryCredStore} from "./auth/impl/InMemoryCredStore";
import {jwtStrategy} from "./auth/impl/jwtStrategies";
import {Health, healthRoutes} from "@http4t/bidi-eg-client/health";
import {Auth, authRoutes, DocStoreClaims} from "@http4t/bidi-eg-client/auth";
import {DocStore, docStoreServerRoutes} from "@http4t/bidi-eg-client/docstore";
import {DockerPgTransactionPool} from "./utils/transactions/DockerPgTransactionPool";

import pg, {PoolConfig} from 'pg';
import {SecuredApi} from "@http4t/bidi/auth/withSecurity";
import {intersection} from "./utils/intersection";
import {healthLogic} from "./health/logic";
import {authLogic} from "./auth/logic";
import {docStoreLogic} from "./docstore/logic";
import {decorate} from "./utils/decorate";

const {Pool} = pg;

export type RouterOpts = { jwt: JwtStrategy, lifecycle?: RequestLifecycle };
export type Deps = {
    creds: CredStore,
    store: DocRepository,
    logger: CumulativeLogger
}

export function docStoreRouter(opts: RouterOpts, apiBuilder: () => Promise<FullApi>): HttpHandler {
    return buildRouter(
        routes(
            healthRoutes,
            authRoutes(),
            docStoreServerRoutes({jwt: opts.jwt})),
        apiBuilder,
        opts.lifecycle || PROD_LIFECYCLE);
}

export type PostgresConfig = { type: "postgres", config: PoolConfig };
export type DockerPostgresConfig = { type: "docker-postgres", config: PoolConfig };
export type DataStoreConfig = PostgresConfig | DockerPostgresConfig;

export type SecureAuthConfig = { type: "secure", publicKey: string, privateKey: string };
export type InsecureAuthConfig = { type: "insecure", expectedSignature: string };
export type AuthConfig = SecureAuthConfig | InsecureAuthConfig;

export type RouterConfig = {
    auth: AuthConfig,
    containsPii: boolean,
    dataStore: DataStoreConfig
};

export type FullApi = Health & Auth & SecuredApi<DocStore, DocStoreClaims>;

export function wrapTransactions(api: FullApi, transaction: Transaction) {
    return decorate(
        api,
        {
            beforeExecution: () => transaction.query('BEGIN'),
            afterSuccess: () => transaction.query('COMMIT'),
            onException: () => transaction.query('ROLLBACK'),
            finally: () => transaction.release()
        });
}


export async function startRouter(opts: RouterConfig): Promise<HttpHandler & Closeable> {
    const jwt = await jwtStrategy(opts.auth);
    const lifecycle = opts.containsPii ? PROD_LIFECYCLE : new DebugRequestLifecycle();
    const logger = new CumulativeLogger();

    const pgTransactionPool = new PostgresTransactionPool(new Pool(opts.dataStore.config));

    const transactionPool = opts.dataStore.type === "docker-postgres"
        ? new DockerPgTransactionPool(pgTransactionPool)
        : pgTransactionPool;


    const credStore = new InMemoryCredStore();

    await migrate(transactionPool);

    const buildApi = async () => {
        const transaction = await transactionPool.getTransaction();

        const deps = {
            creds: credStore,
            store: new PostgresStore(transaction),
            logger,
        };
        const api = intersection(
            healthLogic(deps),
            authLogic({...deps, jwt}),
            docStoreLogic(deps));

        return wrapTransactions(api, transaction)
    };

    const handler = withFilters(
        docStoreRouter({
                jwt: jwt,
                lifecycle: lifecycle
            },
            buildApi),
        httpInfoLogger(logger),
        handleError(logger)
    );
    return {
        async handle(request: HttpRequest): Promise<HttpResponse> {


            return await handler.handle(request);
        },
        async close(): Promise<void> {
            await transactionPool.stop();
        }
    };
}
