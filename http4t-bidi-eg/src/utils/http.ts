import { HttpHandler, HttpRequest, HttpResponse } from "@http4t/core/contract";
import { HttpHandlerFun } from "../router";

export function toHttpHandler(handle: HttpHandlerFun): HttpHandler {
  return new class implements HttpHandler {
    handle(request: HttpRequest): Promise<HttpResponse> {
      return handle(request);
    }
  };
}