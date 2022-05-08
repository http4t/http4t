import {bufferText} from "@http4t/core/bodies";
import {HttpHandler, HttpResponse} from "@http4t/core/contract";
import {get} from "@http4t/core/requests";
import {isFailure} from "@http4t/result";
import {JsonPathError, ResultErrorOpts} from "@http4t/result/JsonPathError";
import {prefix, prefixProducedBy} from "@http4t/result/JsonPathResult";
import {RequestLens, ResponseLens} from "./lenses";
import {HandlerFn, RouteFor, Routes} from "./routes";

/**
 * Creates a function that returns `lens.extract(message)`,
 * or throws `ResultError` if the result is a failure.
 */
function validator<T>(
    routeName: string,
    lens: ResponseLens<T>,
    opts: Partial<ResultErrorOpts> = {}):
    (message: HttpResponse) => Promise<T> {

    return async (response: HttpResponse): Promise<T> => {
        const result = await lens.get(response);
        if (isFailure(result))
            throw new JsonPathError({
                    response: {
                        ...response,
                        body: await bufferText(response.body)
                    }
                },
                prefixProducedBy(
                    prefix(result.error.problems, ["response"]),
                    routeName),
                {
                    ...opts,
                    message: opts.message || "Client received unexpected http response"
                });
        return result.value;
    }
}

export function routeClient<T extends HandlerFn>(
    routeName: string,
    route: RouteFor<T>,
    http: HttpHandler,
    opts: Partial<ResultErrorOpts> = {})
    : T {
    const validate = validator(routeName, route.response, opts);
    const f = async (value: any): Promise<any> => {
        const lens = route.request as RequestLens<any>;
        const request = await lens.set(get("/"), value as any);
        const response = await http.handle(request);
        const bufferedResponse = {...response, body: await bufferText(response.body)};
        return validate(bufferedResponse);
    };

    return f as any;
}

export function buildClient<T>(
    routes: Routes<T>,
    http: HttpHandler,
    opts: Partial<ResultErrorOpts> = {}): T {

    return Object.entries(routes)
        .reduce((acc, [key, route]) => {
                const K = key as keyof T;
                acc[K] = routeClient(key, route as RouteFor<T[typeof K]>, http, opts) as any;
                return acc;
            },
            {} as T);
}
