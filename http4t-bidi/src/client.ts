import {HttpHandler, HttpMessage} from "@http4t/core/contract";
import {get} from "@http4t/core/requests";
import {isFailure} from "@http4t/result";
import {ResultError, ResultErrorOpts} from "@http4t/result/ResultError";
import {HandlerFn, Api, MessageLens, Route, Routes} from "./routes";

/**
 * Creates a function that returns `lens.extract(message)`,
 * or throws `ResultError` if the result is a failure.
 */
function validator<T, TMessage extends HttpMessage>(
  lens: MessageLens<T, TMessage>,
  opts: Partial<ResultErrorOpts> = {}):
  (message: TMessage) => Promise<T> {

  return async (message: TMessage): Promise<T> => {
    const result = await lens.extract(message);
    if (isFailure(result)) throw new ResultError(message, result, opts);
    return result.value;
  }
}

export function $routeClient<TReq, TRes>(
  route: Route<TReq, TRes>,
  http: HttpHandler,
  opts: Partial<ResultErrorOpts> = {})
  : HandlerFn<TReq, TRes> {

  return (request: TReq): Promise<TRes> =>
    route.request.inject(request, get("/"))
      .then(http.handle)
      .then(validator(route.response, opts))
}

export function buildClient<TRoutes extends Routes>(
  routes: TRoutes,
  http: HttpHandler): Api<TRoutes> {
  return Object.entries(routes)
    .reduce((acc, [key, route]) => {
        acc[key as keyof TRoutes] = $routeClient(route, http) as any;
        return acc;
      },
      {} as Api<TRoutes>);
}
