import {HttpHandler, HttpRequest, HttpResponse} from "./contract";

export function handler(f: (request: HttpRequest) => Promise<HttpResponse>): HttpHandler {
  return {handle: f};
}