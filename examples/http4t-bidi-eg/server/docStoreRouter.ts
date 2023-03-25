import {buildRouter, RequestLifecycle} from "@http4t/bidi/router";
import {HttpHandler, HttpRequest, HttpResponse} from "@http4t/core/contract";
import {Closeable} from "@http4t/core/server";
import {handleError} from "./utils/filters/errors";
import {httpInfoLogger} from "./utils/HttpInfoLogger";
import {withFilters} from "@http4t/core/Filter";
import {routes} from "@http4t/bidi/routes";
import {JwtStrategy, serverSideJwtRoutes} from "@http4t/bidi-jwt";
import {PROD_LIFECYCLE} from "@http4t/bidi/lifecycles/ProductionRequestLifecycle";
import {DebugRequestLifecycle} from "@http4t/bidi/lifecycles/DebugRequestLifecycle";
import {jwtStrategy, jwtToOurClaims} from "./auth/impl/jwt";
import {healthRoutes} from "@http4t/bidi-eg-client/health";
import {authRoutes, DocStoreClaims} from "@http4t/bidi-eg-client/auth";
import {docStoreRoutes} from "@http4t/bidi-eg-client/docstore";
import {SecuredRoutes} from "@http4t/bidi/auth";
import {apiBuilder} from "./docStoreApi";
import {DocStoreConfig} from "./config";
import {PerRequestLogger} from "./utils/Logger";

export type RouterOpts = { jwt: JwtStrategy, lifecycle: RequestLifecycle };

export function docStoreServerRoutes(opts: { jwt: JwtStrategy }): SecuredRoutes<typeof docStoreRoutes, DocStoreClaims> {
    return serverSideJwtRoutes(
        docStoreRoutes,
        opts.jwt,
        jwtToOurClaims);
}

function buildRoutes(opts: RouterOpts) {
    return routes(
        healthRoutes,
        authRoutes(),
        docStoreServerRoutes(opts));
}

export async function startRouter(config: DocStoreConfig): Promise<HttpHandler & Closeable> {
    const jwt = await jwtStrategy(config.auth);

    const apiForRequest = await apiBuilder(config);

    const lifecycle = config.containsPii ? PROD_LIFECYCLE : new DebugRequestLifecycle();

    const routes = buildRoutes({jwt, lifecycle});

    return {
        async handle(request: HttpRequest): Promise<HttpResponse> {
            const logger = new PerRequestLogger();

            const router = buildRouter(
                routes,
                () => apiForRequest({logger, jwt}),
                lifecycle)

            const handler = withFilters(
                router,
                httpInfoLogger(logger),
                handleError(logger)
            );

            return await handler.handle(request);
        },
        close(): Promise<unknown> {
            return apiForRequest.close();
        }
    };
}
