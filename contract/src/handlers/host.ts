import {HttpHandler, HttpRequest, HttpResponse} from "../contract";
import * as requests from "../requests";
import {Uri} from "../uri";
import {FetchHandler} from "./browser";

export class HostHandler implements HttpHandler {
  constructor(private handler: HttpHandler, private host: string) {
  }

  handle(request: HttpRequest): Promise<HttpResponse> {
    // TODO: this is so, so wrong
    if(this.handler instanceof FetchHandler)
      return this.handler.handle(requests.modifyRequest(request,{uri:Uri.modify(request.uri, {authority:this.host})}));

    return this.handler.handle(requests.setHeader(request, 'Host', this.host));
  }
}
