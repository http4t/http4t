import {HttpHandler, HttpRequest, HttpResponse} from "../contract";

export function handler(handle: (request:HttpRequest)=>Promise<HttpResponse>): HttpHandler {
  return {handle}
}
