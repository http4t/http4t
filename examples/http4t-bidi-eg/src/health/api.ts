import {header, value} from "@http4t/bidi/messages";
import {response} from "@http4t/bidi/responses";
import {request} from "@http4t/bidi/requests";
import {route, RoutesFor} from "@http4t/bidi/routes";
import {HttpHandler} from "@http4t/core/contract";
import {buildClient} from "@http4t/bidi/client";

export interface Health {
    ready(): Promise<undefined>;

    live(): Promise<undefined>;
}

export const healthRoutes: RoutesFor<Health> = {
    ready: route(
        request('GET', '/probe/ready'),
        response(200, value("*", header("Access-Control-Allow-Origin")))
    ),
    live: route(
        request('GET', '/probe/live'),
        response(200, value("*", header("Access-Control-Allow-Origin")))
    ),
}

export function healthClient(httpClient: HttpHandler): Health {
    return buildClient(healthRoutes, httpClient, {leakActualValuesInError: true});
}

