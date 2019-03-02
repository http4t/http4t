import {HttpHandler, HttpRequest, HttpResponse} from "../contract";
import * as requests from "../requests";

export class HostHandler implements HttpHandler {
  constructor(private handler: HttpHandler, private host: string) {
  }

  handle(request: HttpRequest): Promise<HttpResponse> {
    return this.handler.handle(requests.setHeader(request, 'Host', this.host));
  }
}
