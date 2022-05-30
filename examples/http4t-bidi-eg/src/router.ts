import {buildRouter, RequestLifecycle} from "@http4t/bidi/router";
import {HttpHandler, HttpRequest, HttpResponse} from "@http4t/core/contract";
import {Closeable} from "@http4t/core/server";
import {healthRoutes} from "./health/api";
import {handleError} from "./utils/filters/errors";
import {rollbackOnExceptionOr500} from "./utils/filters/rollbackOnExceptionOr500";
import {httpInfoLogger} from "./utils/HttpInfoLogger";
import {CumulativeLogger} from "./utils/Logger";
import {migrate} from "./migrations";
import {DocRepository} from "./docstore/impl/DocRepository";
import {PostgresTransactionPool} from "./utils/transactions/TransactionPool";
import {withFilters} from "@http4t/core/Filter";
import {routes} from "@http4t/bidi/routes";
import {JwtStrategy} from "@http4t/bidi-jwt";
import {PROD_LIFECYCLE} from "@http4t/bidi/lifecycles/ProductionRequestLifecycle";
import {Pool, PoolConfig} from "pg";
import {DebugRequestLifecycle} from "@http4t/bidi/lifecycles/DebugRequestLifecycle";
import {DockerPgTransactionPool} from "./utils/transactions/DockerPgTransactionPool";
import {CredStore} from "./auth/impl/CredStore";
import {PostgresStore} from "./docstore/impl/PostgresStore";
import {InMemoryCredStore} from "./auth/impl/InMemoryCredStore";
import {authRoutes} from "./auth/api";
import {docStoreRoutes} from "./docstore/api";
import {healthLogic} from "./health/logic";
import {authLogic} from "./auth/logic";
import {docStoreLogic} from "./docstore/logic";
import {intersection} from "./utils/intersection";
import {jwtStrategy} from "./auth/impl/jwtStrategies";

export type RouterOpts = { creds: CredStore, store: DocRepository, logger: CumulativeLogger, jwt: JwtStrategy, lifecycle?: RequestLifecycle };

export function router(opts: RouterOpts): HttpHandler {
    return buildRouter(
        routes(
            healthRoutes,
            authRoutes(opts),
            docStoreRoutes(opts)),
        intersection(
            healthLogic(opts),
            authLogic(opts),
            docStoreLogic(opts)),
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

export async function startRouter(opts: RouterConfig): Promise<HttpHandler & Closeable> {
    const pgTransactionPool = new PostgresTransactionPool(new Pool(opts.dataStore.config));
    const transactionPool = opts.dataStore.type === "docker-postgres"
        ? new DockerPgTransactionPool(pgTransactionPool)
        : pgTransactionPool;

    const lifecycle = opts.containsPii ? PROD_LIFECYCLE : new DebugRequestLifecycle();
    const jwt = await jwtStrategy(opts.auth);
    const credStore = new InMemoryCredStore();

    await migrate(transactionPool);

    return {
        async handle(request: HttpRequest): Promise<HttpResponse> {
            const transaction = await transactionPool.getTransaction();
            const logger = new CumulativeLogger();

            const handler = withFilters(
                router({
                    creds: credStore,
                    store: new PostgresStore(transaction),
                    logger,
                    jwt: jwt,
                    lifecycle: lifecycle
                }),

                httpInfoLogger(logger),
                handleError(logger),
                rollbackOnExceptionOr500(transaction));

            return await handler.handle(request);
        },
        async close(): Promise<void> {
            await transactionPool.stop();
        }
    };
}
