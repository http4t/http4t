import {HttpHandler, HttpRequest, HttpResponse} from "@http4t/core/contract";
import {response} from "@http4t/core/responses";
import {isFailure} from "@http4t/result";
import {Routes, ValidApi} from "./routes";

export class Router<T extends ValidApi> implements HttpHandler {
  constructor(private readonly routes: Routes<T>,
              private readonly handlers: T) {

  }

  handle = async (request: HttpRequest): Promise<HttpResponse> => {
    for (const [key, lens] of Object.entries(this.routes)) {
      const requestObject = await lens.request.extract(request);

      if (isFailure(requestObject)) {
        continue;
      }

      const handler = this.handlers[key];
      const result = await handler(requestObject.value);
      return lens.response.inject(result, response(200))
    }
    return response(404);
  }
}

export function buildRouter<T extends ValidApi>(
  routes: Routes<T>,
  handlers: T): HttpHandler {
  return new Router(routes, handlers);
}
