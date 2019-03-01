import {HttpHandler, HttpRequest, HttpResponse} from "../contract";
import {Headers} from "../headers";
import {modify} from "../util";

export class HostHandler implements HttpHandler {
  constructor(private handler: HttpHandler, private host: string) {
  }

  handle(request: HttpRequest): Promise<HttpResponse> {
    return this.handler.handle(modify(request, 'headers', Headers.replace('Host', this.host)));
  }
}
