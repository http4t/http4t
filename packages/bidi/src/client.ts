import {bufferText} from "@http4t/core/bodies";
import {HttpHandler, HttpResponse} from "@http4t/core/contract";
import {get} from "@http4t/core/requests";
import {isFailure} from "@http4t/result";
import {JsonPathError, ResultErrorOpts} from "@http4t/result/JsonPathError";
import {prefix} from "@http4t/result/JsonPathResult";
import {ResponseLens} from "./lenses";
import {HandlerFn, RouteFor, Routes, ValidApi} from "./routes";

/**
 * Creates a function that returns `lens.extract(message)`,
 * or throws `ResultError` if the result is a failure.
 */
function validator<T>(
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
                prefix(result.error.problems, ["response"]),
                opts);
        return result.value;
    }
}

export function routeClient<T extends HandlerFn>(
    routeName: string,
    route: RouteFor<T>,
    http: HttpHandler,
    opts: Partial<ResultErrorOpts> = {})
    : T {
    const v = validator(route.response, opts);
    const f = async (value: any): Promise<any> => {
        const request = await route.request.set(get("/"), value);
        const response = await http.handle(request);
        const bufferedResponse = {...response, body: await bufferText(response.body)};
        return v(bufferedResponse);
    };

    return f as any;
}

export function buildClient<T extends ValidApi>(
    routes: Routes<T>,
    http: HttpHandler,
    opts: Partial<ResultErrorOpts> = {}): T {
    return Object.entries(routes)
        .reduce((acc, [key, route]) => {
                acc[key as keyof T] = routeClient(key, route, http, opts) as any;
                return acc;
            },
            {} as T);
}
