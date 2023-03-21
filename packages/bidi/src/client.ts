import {bufferText} from "@http4t/core/bodies";
import {HttpHandler, HttpRequest, HttpResponse} from "@http4t/core/contract";
import {bufferedText, get, getHeaderValue, uriString} from "@http4t/core/requests";
import {isFailure} from "@http4t/result";
import {JsonPathError, ResultErrorOpts} from "@http4t/result/JsonPathError";
import {prefix, prefixProducedBy, problem} from "@http4t/result/JsonPathResult";
import {RequestLens, ResponseLens} from "./lenses";
import {ClientApiFor, Route, Routes, ServerApiFnFor} from "./routes";
import {Mutable} from "./util/mutable";
import {assertExhaustive} from "@http4t/core/util/assertExhaustive";
import {Http4tHeaders, Http4tRouteResult} from "./lifecycles/headers";

async function routingError(message: string, routeName: string, request: HttpRequest, response: HttpResponse): Promise<Error> {
    return new JsonPathError({
            request: {
                ...request,
                uri: uriString(request),
                body: await bufferedText(request)
            },
            response: {
                ...response,
                body: await bufferedText(request)
            }
        },
        [problem(message, ["request"], routeName)],
        {
            message: `${response.status}: ${uriString(request)} ${message}. \n` +
                "Perhaps you are using an old version of the client that does not match the latest version of the backend?\n" +
                await bufferText(response.body)
        });
}

/**
 * Creates a function that returns `lens.extract(message)`,
 * or throws `ResultError` if the result is a failure.
 */
function validator<T>(
    routeName: string,
    lens: ResponseLens<T>,
    opts: Partial<ResultErrorOpts> = {}):
    (request: HttpRequest, response: HttpResponse) => Promise<T> {

    return async (request: HttpRequest, response: HttpResponse): Promise<T> => {
        /*
        The http4t router adds headers when routes do not match so that we can explicitly distinguish between:

         - a 404 response that comes from a response lens as expected, which is not an error
         - a 404 that is the result of an old client sending a request that no longer matches any routes on the server

         We want to immediately throw an error for responses to requests that the server did not understand at all,
         rather than trying to parse them with a response lens.
         */
        const routeResult = getHeaderValue(response, Http4tHeaders.ROUTE_RESULT) as Http4tRouteResult | undefined;
        if (routeResult) {
            switch (routeResult) {
                case Http4tRouteResult.SUCCESS:
                    break;
                case Http4tRouteResult.CLIENT_ERROR:
                    throw await routingError("Server could not understand request", routeName, request, response);
                case Http4tRouteResult.NO_MATCH:
                    throw await routingError("Server could not find a valid route for request", routeName, request, response);
                case Http4tRouteResult.SERVER_ERROR:
                    throw await routingError("Server threw an exception", routeName, request, response);
                default:
                    return assertExhaustive(routeResult, `Received an unexpected ${Http4tHeaders.ROUTE_RESULT} header value`)
            }
        }

        const result = await lens.get(response);
        if (isFailure(result))
            throw new JsonPathError({
                    request: {
                        ...request,
                        body: await bufferText(response.body)
                    },
                    response: {
                        ...response,
                        // TODO: what happens if response was a stream that we've already read?
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

export function routeClient<TRoute extends Route>(
    routeName: string,
    route: TRoute,
    http: HttpHandler,
    opts: Partial<ResultErrorOpts> = {})
    : ServerApiFnFor<TRoute> {
    const validate = validator(routeName, route.response, opts);
    const f = async (value: any): Promise<any> => {
        const lens = route.request as RequestLens<any>;
        const request = await lens.set(get("/"), value as any);
        const response = await http.handle(request);
        const bufferedResponse = {...response, body: await bufferText(response.body)};
        return validate(request, bufferedResponse);
    };
    return f as any;
}

export function buildClient<TRoutes extends Routes>(
    routes: TRoutes,
    http: HttpHandler,
    opts: Partial<ResultErrorOpts> = {}): ClientApiFor<TRoutes> {

    return Object.entries(routes)
        .reduce((acc, [key, route]) => {
                acc[key as keyof ClientApiFor<TRoutes>] =
                    routeClient(key, route, http, opts) as any;
                return acc;
            },
            {} as Mutable<ClientApiFor<TRoutes>>);
}
