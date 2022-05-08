import {buildRouter, RequestLifecycle} from "@http4t/bidi/router";
import {HttpHandler, HttpRequest, HttpResponse} from "@http4t/core/contract";
import {Closeable} from "@http4t/core/server";
import {authRoutes, docStoreRoutes, healthRoutes} from "./api";
import {handleError} from "./utils/filters/errors";
import {rollbackOnExceptionOr500} from "./utils/filters/rollbackOnExceptionOr500";
import {httpInfoLogger} from "./utils/HttpInfoLogger";
import {CumulativeLogger} from "./utils/Logger";
import {migrate} from "./db/migrations";
import {DocStore} from "./docstore";
import {PostgresTransactionPool} from "./utils/transactions/TransactionPool";
import {withFilters} from "@http4t/core/Filter";
import {routes} from "@http4t/bidi/routes";
import {JwtStrategy} from "@http4t/bidi-jwt";
import {PROD_LIFECYCLE} from "@http4t/bidi/lifecycles/ProductionRequestLifecycle";
import {ConfigureSigner, serverJwt} from "@http4t/bidi-jwt/jose";
import {Pool, PoolConfig} from "pg";
import {DebugRequestLifecycle} from "@http4t/bidi/lifecycles/DebugRequestLifecycle";
import {importPKCS8, importSPKI} from "jose";
import {DockerPgTransactionPool} from "./utils/transactions/DockerPgTransactionPool";
import {CredStore} from "./auth";
import {businessLogic} from "./businessLogic";
import {PostgresStore} from "./docstore/PostgresStore";
import {InMemoryCredStore} from "./auth/InMemoryCredStore";
import {TotallyInsecureServerJwtStrategy} from "@http4t/bidi-jwt/testing";

export type RouterOpts = { creds: CredStore, store: DocStore, logger: CumulativeLogger, jwt: JwtStrategy, lifecycle?: RequestLifecycle };

export function router(opts: RouterOpts): HttpHandler {
    return buildRouter(routes(healthRoutes, authRoutes(opts), docStoreRoutes(opts)), businessLogic(opts), opts.lifecycle || PROD_LIFECYCLE);
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

async function secureJwtStrategy(auth: SecureAuthConfig) {
    const configureJose: ConfigureSigner = enc => {
        return enc
            .setProtectedHeader({typ: "JWT", alg: "Ed25519"})
            .setIssuedAt()
            .setExpirationTime('8h');
    };

    const publicKey = await importSPKI(auth.publicKey, "Ed25519");
    const privateKey = await importPKCS8(auth.privateKey, "Ed25519");
    return serverJwt(
        {publicKey, privateKey},
        configureJose);
}

export async function jwtStrategy(auth: AuthConfig): Promise<JwtStrategy> {
    switch (auth.type) {
        case "secure":
            return await secureJwtStrategy(auth);
        case "insecure":
            return new TotallyInsecureServerJwtStrategy(auth.expectedSignature)
        default:
            return "exhaustive check" as never;
    }
}

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
