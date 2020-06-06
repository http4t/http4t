import { HttpHandler, HttpRequest, HttpResponse } from "@http4t/core/contract";
import { response } from "@http4t/core/responses";
import { uriTemplate, UriTemplateCaptures } from "@http4t/core/uriTemplate";

export interface HttpRequestWithCaptures extends HttpRequest, UriTemplateCaptures {}

export type HttpHandlerFun = (req: HttpRequest) => Promise<HttpResponse>
export type RoutedHandlerFun = (req: HttpRequestWithCaptures) => Promise<HttpResponse>

export type Route = [HttpRequest, RoutedHandlerFun];

export function routes(...allRoutes: Route[]): HttpHandler {
  return new Router(...allRoutes)
}

export class Router implements HttpHandler {
  private routes: Route[];

  constructor(...routes: Route[]) {
    this.routes = routes}

  public async handle(request: HttpRequest): Promise<HttpResponse> {
    const matchedRoute = this.routes.find(([matchingOnRequest, _handler]) => {
      return matchingOnRequest.method === request.method
        && uriTemplate(matchingOnRequest.uri.path).matches(request.uri.path);
    });

    if (matchedRoute) {
      const [req, handler] = matchedRoute;
      const captures: UriTemplateCaptures = uriTemplate(req.uri.path).extract(request.uri.path);

      return handler({
        ...request,
        ...captures
      });
    }

    return response(404, 'No routes matched')
  }
}
