import { HttpHandler, HttpRequest, HttpResponse } from "@http4t/core/contract";
import { response } from "@http4t/core/responses";
import { Captures, uriTemplate } from "@http4t/core/uriTemplate";

export interface HttpRequestWithCaptures extends HttpRequest {
  captures: Captures
}

export type HttpHandlerFun = (req: HttpRequestWithCaptures) => Promise<HttpResponse>

export type Route = [HttpRequest, HttpHandlerFun];

export function routes(...allRoutes: Route[]): HttpHandler {
  return new Router(...allRoutes)
}

export class Router implements HttpHandler {
  private routes: Route[];

  constructor(...allRoutes: Route[]) {
    this.routes = allRoutes
  }

  public async handle(request: HttpRequest): Promise<HttpResponse> {
    const matchedRoute = this.routes.find(([matchingOnRequest, _handler]) =>
      matchingOnRequest.method === request.method
        && uriTemplate(matchingOnRequest.uri.path).matches(request.uri.path));

    if (matchedRoute) {
      const captures = uriTemplate(matchedRoute[0].uri.path).extract(request.uri.path);
      const requestWithCaptures = {
        ...request,
        captures
      };
      return matchedRoute[1](requestWithCaptures);
    }
    return response(404, 'No routes matched')
  }
}
