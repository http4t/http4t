import {HttpHandler, HttpRequest, HttpResponse} from "@http4t/core/contract";
import {response} from "@http4t/core/responses";
import {isFailure} from "@http4t/result";
import {Api, Routes} from "./routes";

export class Server<T extends Routes> implements HttpHandler {
  constructor(private readonly routes: T,
              private readonly handlers: Api<T>) {

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

export function buildServer<T extends Routes>(
  routes: T,
  handlers: Api<T>): HttpHandler {
  return new Server(routes, handlers);
}