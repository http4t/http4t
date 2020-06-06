import {HttpHandler, HttpMessage} from "@http4t/core/contract";
import {get} from "@http4t/core/requests";
import {isFailure} from "@http4t/result";
import {ResultError, ResultErrorOpts} from "@http4t/result/ResultError";
import {HandlerFn, MessageLens, RouteFor, Routes, ValidApi} from "./routes";

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

export function routeClient<T extends HandlerFn>(
  route: RouteFor<T>,
  http: HttpHandler,
  opts: Partial<ResultErrorOpts> = {})
  : T {

  const f = async (request: any): Promise<any> => {
    return await route.request.inject(request, get("/"))
      .then(http.handle)
      .then(validator(route.response, opts));
  };

  return f as any;
}

export function buildClient<T extends ValidApi>(
  routes: Routes<T>,
  http: HttpHandler): T {
  return Object.entries(routes)
    .reduce((acc, [key, route]) => {
        acc[key as keyof T] = routeClient(route, http) as any;
        return acc;
      },
      {} as T);
}
