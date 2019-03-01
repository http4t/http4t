import {
  delete_,
  get,
  HandlerFunction,
  HttpHandler,
  HttpRequest,
  HttpResponse,
  notFound,
  ok,
  patch,
  post,
  put
} from "../";
import {const_} from "../util";
import {echoMessage} from "./echo";
import {handler} from "./function";

export function isPartial<T>(instance: T, partial: Partial<T>): boolean {
  return Object.keys(partial).every(function (k) {
    let key = k as keyof T;
    let actual: any = instance[key];
    let expected: any = partial[key];

    if (actual instanceof Object && expected instanceof Object) {
      return isPartial(actual, expected);
    }
    return partial[key] === actual;
  });
}

export function routing(routes: [Partial<HttpRequest>, HttpHandler][]): HttpHandler {
  return {
    handle: async (request: HttpRequest): Promise<HttpResponse> => {
      const match: [Partial<HttpRequest>, HttpHandler] | undefined
        = routes.find((route) => isPartial(request, route[0]));

      return match ? match[1].handle(request) : notFound();
    }
  }
}

export class BinHandler implements HttpHandler {
  private readonly routing = routing([
    [get('/get'), handler(const_(Promise.resolve(ok())))],
    [post('/post'), echoMessage],
    [put('/put'), echoMessage],
    [patch('/patch'), echoMessage],
    [delete_('/delete'), echoMessage],
  ]);

  async handle(request: HttpRequest): Promise<HttpResponse> {
    return this.routing.handle(request);
  }
}

